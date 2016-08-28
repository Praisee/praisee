export interface IVoteModel extends IPersistedModel {

}

export interface IVoteInstance extends IPersistedModelInstance {
    isUpVote: boolean
    userId: number
    createdAt: Date
    updatedAt: Date
}
