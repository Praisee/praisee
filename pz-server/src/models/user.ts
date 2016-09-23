import {ICommunityItemModel} from 'pz-server/src/models/community-item';
import promisify from 'pz-support/src/promisify';

export interface IUserModel extends IPersistedModel {
    getTotalCommunityItems(userId: number): Promise<number>
    getTotalTrusters(userId: number): Promise<number>
    isUserTrusting(trusterId: number, trustedId: number): Promise<boolean>
}

export interface IUserInstance extends IPersistedModelInstance {
    id: number
    displayName: string
    email: string
    created: Date
    trusters?: IRelatedPersistedModel<IUserInstance[]>
    trusting?: IRelatedPersistedModel<IUserInstance[]>
}

module.exports = function (User: IUserModel) {
    User.getTotalCommunityItems = async (userId: number) => {
        const CommunityItem: ICommunityItemModel = User.app.models.CommunityItem;
        const getCount = promisify(CommunityItem.count, CommunityItem);

        return await getCount({
            userId: userId
        });
    }
    
    User.getTotalTrusters = async (userId: number) => {
        const Trust = User.app.models.Trust;
        const getCount = promisify(Trust.count, Trust);

        return await getCount({
            trustedId: userId
        });
    }
    
    User.isUserTrusting = async (trusterId: number, trustedId: number) => {
        const Trust = User.app.models.Trust;
        const find = promisify(Trust.find, Trust);

        let result: any = await find({
            trustedId,
            trusterId
        });
        
        return result.length > 0;
     }
};
