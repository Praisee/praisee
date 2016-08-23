import {IAuthorizer} from 'pz-server/src/support/authorization';

import {IUsers} from 'pz-server/src/users/users';
import {IAuthorizedUsers} from 'pz-server/src/users/users-authorizer';

import {ITopics} from 'pz-server/src/topics/topics';
import {IAuthorizedTopics} from 'pz-server/src/topics/topics-authorizer';

import {ICommunityItems} from '../community-items/community-items';
import {IAuthorizedCommunityItems} from 'pz-server/src/community-items/community-items-authorizer';

import {IComments} from '../comments/comments';
import {IAuthorizedComments} from 'pz-server/src/comments/comments-authorizer';

import {IVotes} from 'pz-server/src/votes/votes';
import {IAuthorizedVotes} from 'pz-server/src/votes/votes-authorizer';

export interface IAppRepositories {
    users: IUsers,
    topics: ITopics,
    communityItems: ICommunityItems,
    comments: IComments
    votes: IVotes
}

export interface IAppAuthorizedRepository {
    findById(id: number): Promise<any>
}

type TAppAuthorizer<T> = IAuthorizer<T & IAppAuthorizedRepository>;

export interface IAppRepositoryAuthorizers {
    users: TAppAuthorizer<IAuthorizedUsers>
    topics: TAppAuthorizer<IAuthorizedTopics>
    communityItems: TAppAuthorizer<IAuthorizedCommunityItems>
    comments: TAppAuthorizer<IAuthorizedComments>
    votes: TAppAuthorizer<IAuthorizedVotes>
}
