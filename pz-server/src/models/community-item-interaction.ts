export interface ICommunityItemInteractionModel extends IPersistedModel {

}

export interface ICommunityItemInteractionInstance extends IPersistedModelInstance {
    hasMarkedRead: boolean
    createdAt: Date
    updatedAt: Date
}

module.exports = function (CommunityItemInteraction: ICommunityItemInteractionModel) {
};
