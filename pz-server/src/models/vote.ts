export interface IVoteModel extends IPersistedModel {

}

export interface IVoteInstance extends IPersistedModelInstance {
    isUpVote: boolean
    userId: number
    parentType?: string
    parentId?: number
    affectedUserId?: number
    createdAt: Date
    updatedAt: Date
}

module.exports = function (Vote: IVoteModel) {
    Vote.observe('before save', async (context) => {
        const instance: IVoteInstance = context.instance || context.data;

        if(typeof(instance.affectedUserId) !== 'undefined') return;
        
        let parentModel = Vote.app.models[instance.parentType];
        let parentInstance = await parentModel.findById(instance.parentId);
        instance.affectedUserId = parentInstance.userId;
    });
}