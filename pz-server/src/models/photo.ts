import {IUserInstance} from 'pz-server/src/models/user';
import {ICommunityItemInstance} from 'pz-server/src/models/community-item';
import {IVoteInstance} from 'pz-server/src/models/vote';

export interface IPhotoModel extends IPersistedModel {
}

export interface IPhotoInstance extends IPersistedModelInstance {
    id: number
    userId: number
    parentType: string
    parentId: number
    isUploaded: boolean
    photoServerPath?: string
    createdAt: Date
    updatedAt: Date
    user?: IRelatedPersistedModel<IUserInstance>
    parent?: IRelatedPersistedModel<ICommunityItemInstance>
    votes?: IRelatedPersistedModel<Array<IVoteInstance>>
}
