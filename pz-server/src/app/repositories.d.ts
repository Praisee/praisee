import {IAuthorizer} from 'pz-server/src/support/authorization';

import {IUsers} from 'pz-server/src/users/users';
import {IAuthorizedUsers} from 'pz-server/src/users/users-authorizer';

import {ITopics} from 'pz-server/src/topics/topics';
import {IAuthorizedTopics} from 'pz-server/src/topics/topics-authorizer';

import {ITopicAttributes} from 'pz-server/src/topics/topic-attributes/topic-attributes';
import {IAuthorizedTopicAttributes} from 'pz-server/src/topics/topic-attributes/topic-attributes-authorizer';

import {ICommunityItems} from 'pz-server/src/community-items/community-items';
import {IAuthorizedCommunityItems} from 'pz-server/src/community-items/community-items-authorizer';

import {IComments} from 'pz-server/src/comments/comments';
import {IAuthorizedComments} from 'pz-server/src/comments/comments-authorizer';

import {IVotes} from 'pz-server/src/votes/votes';
import {IAuthorizedVotes} from 'pz-server/src/votes/votes-authorizer';

import {ITrackedEvents} from 'pz-server/src/tracked-events/tracked-events';

import {IRankingsCache} from 'pz-server/src/rankings/rankings-cache';
import {IRankings} from 'pz-server/src/rankings/rankings';

import {IVanityRoutePaths} from 'pz-server/src/vanity-route-paths/vanity-route-paths';
import {IAuthorizedVanityRoutePaths} from 'pz-server/src/vanity-route-paths/vanity-route-paths-authorizer';

import {IPhotos} from 'pz-server/src/photos/photos';
import {IAuthorizedPhotos} from 'pz-server/src/photos/photos-authorizer';

export interface IAppRepositories {
    users: IUsers
    topics: ITopics
    topicAttributes: ITopicAttributes
    communityItems: ICommunityItems
    comments: IComments
    votes: IVotes
    trackedEvents: ITrackedEvents
    rankingsCache: IRankingsCache
    rankings: IRankings
    vanityRoutePaths: IVanityRoutePaths;
    photos: IPhotos
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
    vanityRoutePaths: IAuthorizer<IAuthorizedVanityRoutePaths>
    topicAttributes: TAppAuthorizer<IAuthorizedTopicAttributes>
    photos: TAppAuthorizer<IAuthorizedPhotos>
}
