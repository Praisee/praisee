import {Form} from 'multiparty';

import {
    IAuthorizer,
    isAuthorizationError
} from 'pz-server/src/support/authorization';
import {IAuthorizedPhotos} from 'pz-server/src/photos/photos-authorizer';

import * as path from 'path';

import appInfo from 'pz-server/src/app/app-info';
import {getPhotoVariationsUrls} from 'pz-server/src/photos/photo-variations';

var requestJs = require('request');
requestJs.debug = true;

var photoServerUploadApi = 'http://localhost:8888/image';
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
    const photos: IAuthorizer<IAuthorizedPhotos> = app.services.repositoryAuthorizers.photos;

    app.post(appInfo.addresses.getCommunityItemPhotoUploadApi(), async (request, response, next) => {
        if (!request.user) {
            return respondWithNotAuthorized(response, 'User is not signed in.');
        }

        const photo = await photos.as(request.user).createUploadingPhoto();

        if (isAuthorizationError(photo)) {
            return respondWithNotAuthorized(response, 'User is not allowed to upload photos.');
        }

        const photoId = photo.id;

        let form = new Form();
        let photoHandled = false;

        form.on('part', (formPart) => {
            const contentType = formPart.headers['content-type'];

            if (formPart.name !== photoUploadFormField) {
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

            const formData = {
                media: {
                    value: formPart,
                    options: {
                        filename: formPart.filename,
                        contentType,
                        knownLength: formPart.byteCount
                    }
                }
            };

            const uploadRequest = {
                url: photoServerUploadApi,
                formData,
                preambleCRLF: true,
                postambleCRLF: true
            };

            requestJs.post(uploadRequest, (error, uploadResponse) => {
                if (error) {
                    next(error);
                    return;
                }

                if (uploadResponse.statusCode === 201 && uploadResponse.headers['location']) {
                    const photoPath = path.relative('/image', uploadResponse.headers['location']);
                    respondWithSuccess(response, photoId, photoPath);
                    photos.as(request.user).updateToUploadedPhoto(photoId, photoPath);
                    return;
                }

                if (uploadResponse.statusCode === 415) {
                    respondWithUnsupportedFileType(
                        response,
                        'The provided file type cannot be handled by this server.'
                    );
                    return;
                }

                if (uploadResponse.statusCode === 412) {
                    respondWithFileConstraintError(
                        response,
                        'The provided file is either too big or failed some other validation constraint.'
                    );
                    return;
                }

                console.error(
                    'Received an unexpected response from the image upload service:',
                    response.statusCode,
                    response.statusMessage,
                    request,
                    response
                );

                next(new Error('Unexpected error response from image upload service: ' + response.statusCode));
            });
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
};
