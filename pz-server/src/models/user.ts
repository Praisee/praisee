import {ICommunityItemModel} from 'pz-server/src/models/community-item';
import promisify from 'pz-support/src/promisify';

export interface IUserModel extends IPersistedModel {
    getTotalCommunityItems(userId: number): Promise<number>
}

export interface IUserInstance extends IPersistedModelInstance {
    id: number
    displayName: string
    email: string
    created: Date
}

module.exports = function (User: IUserModel) {
    User.getTotalCommunityItems = async (userId: number) => {
        const CommunityItem: ICommunityItemModel = User.app.models.CommunityItem;
        const getCount = promisify(CommunityItem.count, CommunityItem);

        return await getCount({
            userId: userId
        });
    }
};
