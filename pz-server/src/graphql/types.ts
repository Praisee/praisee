import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import communityItemTypes from 'pz-server/src/community-items/community-items-graphql';
import voteTypes from 'pz-server/src/votes/votes-graphql';
import userTypes from 'pz-server/src/users/users-graphql';
import commentTypes from 'pz-server/src/comments/comments-graphql';
import viewerTypes from 'pz-server/src/graphql/viewer-graphql';
import topicTypes from 'pz-server/src/topics/topics-graphql';
import {getTopicAttributeTypes} from 'pz-server/src/topics/topic-attributes/topic-attributes-graphql';
import {getResponseErrorTypes} from 'pz-server/src/errors/errors-graphql';
import inputDataTypes from 'pz-server/src/content/input-content-data';
import {getStaticPhotosTypes} from 'pz-server/src/photos/static-photos-graphql';

export function initializeTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface): ITypes {
    let types: any = {};

    types = Object.assign(
        types,
        voteTypes(repositoryAuthorizers, nodeInterface, types),
        commentTypes(repositoryAuthorizers, nodeInterface, types),
        userTypes(repositoryAuthorizers, nodeInterface, types),
        userTypes(repositoryAuthorizers, nodeInterface, types),
        topicTypes(repositoryAuthorizers, nodeInterface, types),
        getTopicAttributeTypes(repositoryAuthorizers, nodeInterface, types),
        communityItemTypes(repositoryAuthorizers, nodeInterface, types),
        getStaticPhotosTypes(types),
        getResponseErrorTypes(repositoryAuthorizers, nodeInterface, types),
        viewerTypes(repositoryAuthorizers, nodeInterface, types),
        inputDataTypes(repositoryAuthorizers, nodeInterface, types)
    );

    return types;
}

export interface ITypes {
    UserInterfaceType
    CurrentUserType
    OtherUserType
    ToggleTrustMutation
    GetCurrentUserMutation

    VoteType
    VoteAggregateType

    CommunityItemInterfaceType

    communityItemTypes: {
        general
        review
    }

    CommunityItemConnection
    CreateCommunityItemMutation
    UpdateCommunityItemContentMutation
    UpdateCommunityItemTypeMutation
    DestroyCommunityItemMutation
    UpdateCommunityItemInteractionMutation
    UpdateReviewDetailsMutation

    CreateVoteMutation
    UpdateVoteMutation
    DeleteVoteMutation

    CommentType
    CommentConnection
    CreateCommentMutation
    UpdateCommentMutation

    TopicType
    TopicThumbnailPhotoType

    TopicAttributeInterfaceType
    topicAttributeTypes: {
        [topicAttributeType: string]: any
    }

    ResponseErrorInterfaceType
    responseErrorTypes: {
        [responseErrorType: string]: any
    }

    ViewerType

    InputContentDataType

    StaticPhotoType
}


//TODO: Implement registry from https://github.com/graphql/graphql-relay-js/issues/25 ??
// const TYPE_REGISTRY = {};

// export function registerType(type, resolveById) {
//     TYPE_REGISTRY[type.name] = {
//         type,
//         resolveById
//     };
//     return type;
// }

// export const {nodeInterface, nodeField} = nodeDefinitions(
//     (globalId, info) => {
//         const { type, id } = fromGlobalId(globalId);
//         let obj = TYPE_REGISTRY[type] ? TYPE_REGISTRY[type].resolveById(id, info) : null;
//         return obj;
//     }
// );
