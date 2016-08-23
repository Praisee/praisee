export interface IVoteModel extends IPersistedModel {

}

export interface IVoteInstance extends IPersistedModelInstance {
    upVote: boolean
    userId: number
    affectedUserId: number
    createdAt: Date
    updatedAt: Date
}
