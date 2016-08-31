import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import CommunityItemTypes from 'pz-server/src/community-items/community-items-graphql';
import VoteTypes from 'pz-server/src/votes/votes-graphql';
import UserTypes from 'pz-server/src/users/users-graphql';
import CommentTypes from 'pz-server/src/comments/comments-graphql';
import ViewerTypes from 'pz-server/src/graphql/viewer-graphql';
import TopicTypes from 'pz-server/src/topics/topics-graphql';

export function initializeTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface): ITypes {
    let types: any = {};

    types = Object.assign(
        types,
        VoteTypes(repositoryAuthorizers, nodeInterface, types),
        CommentTypes(repositoryAuthorizers, nodeInterface, types),
        UserTypes(repositoryAuthorizers, nodeInterface, types),
        UserTypes(repositoryAuthorizers, nodeInterface, types),
        TopicTypes(repositoryAuthorizers, nodeInterface, types),
        CommunityItemTypes(repositoryAuthorizers, nodeInterface, types),
        ViewerTypes(repositoryAuthorizers, nodeInterface, types)
    );

    return types;
}

export interface ITypes {
    UserType;
    OtherUserType;
    VoteType;
    VoteAggregateType;
    CommunityItemType;
    CommunityItemConnection;
    CreateCommunityItemMutation;
    CreateCommunityItemVoteMutation;
    UpdateCommunityItemVoteMutation;
    DeleteCommunityItemVoteMutation;
    CommentType;
    CommentConnection;
    TopicType;
    ViewerType;
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