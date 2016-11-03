import {Form} from 'multiparty';
import promisify from 'pz-support/src/promisify';
import createGoogleCloudStorage from '@google-cloud/storage';
import uuid from 'node-uuid';

import {
    IAuthorizer,
    isAuthorizationError
} from 'pz-server/src/support/authorization';
import {IAuthorizedPhotos} from 'pz-server/src/photos/photos-authorizer';

import * as path from 'path';

import appInfo from 'pz-server/src/app/app-info';
import {getCommunityItemContentPhotoVariationsUrls as getPhotoVariationsUrls} from 'pz-server/src/photos/photo-variations';
import {IPhoto, IPhotos} from 'pz-server/src/photos/photos';
import ExtendableError from 'pz-server/src/support/extendable-error';
import {ITopicInstance} from 'pz-server/src/models/topic';
import createSlug from 'pz-server/src/url-slugs/slugger';

var requestJs = require('request');
requestJs.debug = true;

var photoUploadFormField = 'photoFile';

var maxPhotoSizeInMb = 25;
var oneMegabyte = 1024*1024;

function respondWithSuccess(response, photoId, newFilePath) {
    response.json({photoId, photoUrls: getPhotoVariationsUrls(newFilePath)});
}

function respondWithBadRequest(response, errorMessage) {
    response.status(400).json({error: errorMessage});
}

function respondWithNotAuthorized(response, errorMessage) {
    response.status(401).json({error: errorMessage});
}

function respondWithFileConstraintError(response, errorMessage) {
    response.status(412).json({error: errorMessage});
}

function respondWithUnsupportedFileType(response, errorMessage) {
    response.status(415).json({error: errorMessage});
}

module.exports = function (app: IApp) {
    createPhotoUploadRoute(
        app,

        appInfo.addresses.getCommunityItemPhotoUploadApi(),

        async (): Promise<IPhoto> => ({
            recordType: 'Photo',
            purposeType: 'CommunityItemContent'
        })
    );

    const TopicModel = app.models.Topic;
    const Photos: IPhotos = app.services.repositories.photos;

    createPhotoUploadRoute(
        app,

        appInfo.addresses.getTopicThumbnailPhotoUploadApi(),

        async (request): Promise<IPhoto | BadRequestError> => {
            if (!request.params || !request.params.topicId) {
                return new BadRequestError('No topic ID provided');
            }

            const topicId = request.params.topicId;
            const topic = await promisify(TopicModel.findById, app.models.Topic)(topicId) as ITopicInstance;
            const topicPhotos = await promisify(topic.photos, topic)({where: {purposeType: 'TopicThumbnail'}});

            // TODO: THIS IS A SECURITY ISSUE AND NEEDS TO BE FIXED. ANYONE CAN ERASE TOPIC PHOTOS
            if (topicPhotos.length) {
                const existingThumbnail = topicPhotos[0];

                if (existingThumbnail) {
                    console.log(`Destroying existing photo`
                        + ` (photoId: ${existingThumbnail.id}) for topic`
                        + ` (topicId: ${topic.id})`);

                    await Photos.destroy(existingThumbnail.id);
                }
            }

            return {
                recordType: 'Photo',
                purposeType: 'TopicThumbnail',
                parentType: 'Topic',
                parentId: topic.id
            };
        }
    );
};

export class BadRequestError extends ExtendableError {
    constructor(message = 'Bad request') { super(message); }
}

export function createPhotoUploadRoute(
        app: IApp,
        routePath: string,
        getDataForNewPhoto: (request) => Promise<IPhoto | BadRequestError>
    ) {

    const photos: IAuthorizer<IAuthorizedPhotos> = app.services.repositoryAuthorizers.photos;

    app.post(routePath, async (request, response, next) => {
        if (!request.user) {
            return respondWithNotAuthorized(response, 'User is not signed in.');
        }

        const photoData = await getDataForNewPhoto(request);

        if (photoData instanceof BadRequestError) {
            return respondWithBadRequest(response, photoData.message);
        }

        const photo = await photos.as(request.user).createUploadingPhoto(photoData);

        if (isAuthorizationError(photo)) {
            return respondWithNotAuthorized(response, 'User is not allowed to upload photos.');
        }

        const photoId = photo.id;

        let form = new Form();
        let photoHandled = false;

        form.on('part', (formPart) => {
            const contentType = formPart.headers['content-type'];

            if (!contentType || formPart.name !== photoUploadFormField) {
                formPart.resume();
                return;
            }

            photoHandled = true;

            if (!contentType.startsWith('image/')) {
                respondWithUnsupportedFileType(
                    response,
                    'The provided file type cannot be handled by this server.'
                );
                return;
            }

            if (formPart.byteCount > (maxPhotoSizeInMb * oneMegabyte)) {
                respondWithFileConstraintError(
                    response,
                    'The provided file is too big.'
                );
                return;
            }

            // TODO: The upload handler should be passed in, instead of hardcoded
            (uploadToGoogleCloudStorage(formPart, formPart.filename, contentType, formPart.byteCount)
                .then(({statusCode, photoPath}) => {
                    if (statusCode === 200) {
                        respondWithSuccess(response, photoId, photoPath);
                        photos.as(request.user).updateToUploadedPhoto(photoId, photoPath);
                        return;
                    }

                    if (statusCode === 415) {
                        respondWithUnsupportedFileType(
                            response,
                            'The provided file type cannot be handled by this server.'
                        );
                        return;
                    }

                    if (statusCode === 412) {
                        respondWithFileConstraintError(
                            response,
                            'The provided file is either too big or failed some other validation constraint.'
                        );
                        return;
                    }

                    console.error(
                        'Received an unexpected response from the image upload service:',
                        statusCode,
                        request,
                        response
                    );

                    throw new Error('Unexpected error response from image upload service: ' + statusCode);
                })

                .catch(error => {
                    if (error) {
                        next(error);
                        return;
                    }
                })
            );
        });

        form.on('error', (error) => {
            next(error);
        });

        form.on('close', () => {
            if (!photoHandled) {
                respondWithBadRequest(
                    response,
                    `No file form part was found. Ensure the`
                    + ` field '${photoUploadFormField}' is set in the`
                    + ` multi-part request.`
                )
            }
        });

        form.parse(request);
    });
}

interface IPhotoUploadResponse {
    statusCode: number
    photoPath?: string
}

export function uploadToThumbor(
        photoStream: any, filename: string, contentType: string, byteCount: number
    ): Promise<IPhotoUploadResponse> {

    return new Promise((resolve, reject) => {
        const formData = {
            media: {
                value: photoStream,
                options: {
                    filename: filename,
                    contentType,
                    knownLength: byteCount
                }
            }
        };

        const uploadRequest = {
            url: appInfo.addresses.getPhotoServerUploadApi(),
            formData,
            preambleCRLF: true,
            postambleCRLF: true
        };

        requestJs.post(uploadRequest, (error, uploadResponse) => {
            if (error) {
                reject(error);
                return;
            }

            if (uploadResponse.statusCode === 201 && uploadResponse.headers['location']) {
                const photoPath = path.relative('/image', uploadResponse.headers['location']);
                resolve({statusCode: 200, photoPath});
                return;
            }

            resolve({statusCode: uploadResponse.statusCode})
        });
    });
}

export async function uploadToGoogleCloudStorage(
    photoStream: any, filename: string, contentType: string, byteCount: number
): Promise<IPhotoUploadResponse> {

    const createPhotoPath = () => {
        const sanitizedFilename = createSlug(filename, {
            minChars: 1,
            replacementPattern: /[^a-zA-Z0-9\.]/g,
            nonRepeatableChars: '.',
            onFailureCall: () => uuid.v4()
        });

        return uuid.v4() + '/' + sanitizedFilename;
    };

    const storage = createGoogleCloudStorage({projectId: appInfo.googleCloud.projectId()});
    const bucket = storage.bucket(appInfo.googleCloud.photoServerBucket());

    let photoPath = null;

    for (let i = 0; i < 3; ++i) {
        let temporaryPhotoPath = createPhotoPath();
        let [fileCollision] = await bucket.file(temporaryPhotoPath).exists();

        if (!fileCollision) {
            photoPath = temporaryPhotoPath;
            break;
        }
    }

    if (!photoPath) {
        throw new Error('Failed to generate a unique file name for: ' + filename);
    }

    return new Promise<IPhotoUploadResponse>((resolve, reject) => {
        // TODO: We should be checking to ensure the file is an image, otherwise
        // TODO: this could be uploading malware

        const remoteWriteStream = bucket.file(photoPath).createWriteStream();

        (photoStream.pipe(remoteWriteStream)
            .on('error', function(error) {
                reject(error);
            })

            .on('finish', function() {
                resolve({statusCode: 200, photoPath})
            })
        );
    });
}

