import {ICursorResults} from '../support/cursors/cursors';
import loopbackQuery from '../support/loopback-query';
import {
    IUrlSlugInstance,
    IUrlSlugModel
} from 'pz-server/src/url-slugs/models/url-slug';
import promisify from 'pz-support/src/promisify';
import {IUsers, IUser, IUsersBatchable} from 'pz-server/src/users/users';
import {IUserInstance, IUserModel} from 'pz-server/src/models/user';
import {createRecordFromLoopback} from 'pz-server/src/support/repository';
import {loopbackFindAllByIds} from 'pz-server/src/support/loopback-find-all-helpers';
const moment = require('moment');

export function createRecordFromLoopbackUser(user: IUserInstance): IUser {
    return createRecordFromLoopback<IUser>('User', user);
}

export default class Users implements IUsers, IUsersBatchable {
    private _UserModel: IUserModel;
    private _UrlSlugsModel: IPersistedModel;

    constructor(User: IUserModel, UrlSlug: IUrlSlugModel) {
        this._UserModel = User;
        this._UrlSlugsModel = UrlSlug;
    }

    async findById(userId: number): Promise<IUser> {
        const result = await promisify(this._UserModel.findById, this._UserModel)(userId);

        if (!result) {
            return null;
        }

        return createRecordFromLoopbackUser(result);
    }

    async findAllByIds(userIds: Array<number>): Promise<Array<IUser>> {
        const userModels = await loopbackFindAllByIds<IUserModel, IUserInstance>(
            this._UserModel,
            userIds
        );

        return userModels.map(userModel => {
            return createRecordFromLoopbackUser(userModel);
        });
    }

    async findByUrlSlugName(fullSlug: string): Promise<IUser> {
        let urlSlug: IUrlSlugInstance = await promisify(this._UrlSlugsModel.findOne, this._UrlSlugsModel)({
            where: {
                sluggableType: this._UserModel.sluggableType,
                fullSlugLowercase: fullSlug.toLowerCase()
            }
        });

        if (urlSlug) {
            const result = await promisify(this._UserModel.findById, this._UserModel)(urlSlug.sluggableId);
            return createRecordFromLoopbackUser(result);
        }

        return null;
    }

    async getTotalCommunityItems(userId: number): Promise<number> {
        return await this._UserModel.getTotalCommunityItems(userId);
    }

    async getTotalTrusters(userId: number): Promise<number> {
        return await this._UserModel.getTotalTrusters(userId);
    }

    async getReputation(userId: number): Promise<number> {
        return this._UserModel.getReputation(userId);
    }

    async getActivityStats(userId: number): Promise<any> {
        const oneMonthAgo = moment().subtract(1, 'month').format('YYYY-MM-DD');
        const query = `
            SELECT
                (
                    SELECT COUNT(*) FROM Comment
                    WHERE Comment.userid = ${userId} AND Comment.createdat > timestamp '${oneMonthAgo}'
                ) AS comments,
                (
                    SELECT COUNT(*) FROM CommunityItem
                    WHERE CommunityItem.userid = ${userId} AND CommunityItem.createdat > timestamp '${oneMonthAgo}'
                ) AS communityItems,
                (
                    SELECT COUNT(*) FROM Vote
                    WHERE Vote.affecteduserid = ${userId} AND Vote.createdat > timestamp '${oneMonthAgo}'
                    AND isupvote = true AND parenttype = 'CommunityItem'
                ) AS communityItemUpVotes,
                (
                    SELECT COUNT(*) FROM Vote
                    WHERE Vote.affecteduserid = ${userId} AND Vote.createdat > timestamp '${oneMonthAgo}'
                    AND isupvote = false AND parenttype = 'CommunityItem'
                ) AS communityItemDownVotes,
                (
                    SELECT COUNT(*) FROM Vote
                    WHERE Vote.affecteduserid = ${userId} AND Vote.createdat > timestamp '${oneMonthAgo}'
                    AND isupvote = true AND parenttype = 'Comment'
                ) AS commentUpVotes,
                (
                    SELECT COUNT(*) FROM Vote
                    WHERE Vote.affecteduserid = ${userId} AND Vote.createdat > timestamp '${oneMonthAgo}'
                    AND isupvote = false AND parenttype = 'Comment'
                ) AS commentDownVotes,
                (
                    SELECT COUNT(*) FROM Trust
                    WHERE Trust.trustedid = ${userId} AND Trust.createdat > timestamp '${oneMonthAgo}'
                ) AS trusts
        `;

        const results: any= await loopbackQuery(this._UserModel, query);
        const {comments, communityitems,
                communityitemupvotes, communityitemdownvotes, 
                commentupvotes, commentdownvotes, trusts} = results[0];
        
        const votes = {
            communityItemUpVotes: parseInt(communityitemupvotes),
            communityItemDownVotes: parseInt(communityitemdownvotes),
            commentUpVotes: parseInt(commentupvotes),
            commentDownVotes: parseInt(commentdownvotes),
        }
        
        const reputation = this.calculateReputation(votes, trusts);

        return {
            comments: parseInt(comments),
            communityItems: parseInt(communityitems),
            upVotes: votes.communityItemUpVotes + votes.commentUpVotes,
            downVotes: votes.communityItemDownVotes + votes.commentDownVotes,
            trusts: parseInt(trusts),
            reputation
        }
    }

    calculateReputation({communityItemUpVotes, communityItemDownVotes, commentUpVotes, commentDownVotes}, trusts: number){
        let communityItemUpVoteReputation = communityItemUpVotes * 10;
        let communityItemDownVoteReputation = communityItemDownVotes * 5;
        let communityItemReputation = communityItemUpVoteReputation - communityItemDownVoteReputation;

        let commentUpVoteReputation = commentUpVotes * 4;
        let commentDownVoteReputation = commentDownVotes * 2;
        let commentReputation = commentUpVoteReputation - commentDownVoteReputation;
        
        return communityItemUpVoteReputation + commentReputation;
    }

    async isUserTrusting(trusterId: number, trustedId: number): Promise<boolean> {
        return await this._UserModel.isUserTrusting(trusterId, trustedId);
    }

    async addTrust(trusterId: number, trustedId: number): Promise<boolean> {
        const find = promisify(this._UserModel.find, this._UserModel);

        const userModels: Array<IUserInstance> = await find({
            where: { id: { inq: [trusterId, trustedId] } }
        });

        let truster = userModels.find((user) => user.id === trusterId);
        let trusted = userModels.find((user) => user.id === trustedId);
        return trusted.trusters.add(truster);
    }

    async removeTrust(trusterId: number, trustedId: number): Promise<boolean> {
        const find = promisify(this._UserModel.find, this._UserModel);

        const userModels: Array<IUserInstance> = await find({
            where: { id: { inq: [trusterId, trustedId] } }
        });

        let truster = userModels.find((user) => user.id === trusterId);
        let trusted = userModels.find((user) => user.id === trustedId);
        return trusted.trusters.remove(truster);
    }

    async create(email: string, password: string, displayName: string): Promise<IUser> {
        const createUser = promisify(this._UserModel.create, this._UserModel);
        const user = await createUser({ email, password, displayName });
        return user;
    }

    async update(user: IUser): Promise<IUser> {
        if (!user.id) {
            throw new Error('Cannot update record without an id');
        }

        let userInstance: IUserInstance = await promisify(
            this._UserModel.findById, this._UserModel)(user.id);

        if (!userInstance) {
            throw new Error('Could not find user with id: ' + user.id);
        }

        userInstance.displayName = user.displayName;
        userInstance.bio = user.bio;

        const result = await promisify(userInstance.save, userInstance)();
        return createRecordFromLoopbackUser(result);
    }
}
