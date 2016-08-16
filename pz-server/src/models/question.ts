import {ICommunityItemModel} from 'pz-server/src/models/community-item';

module.exports = function (Question: ICommunityItemModel) {
    Question.type = 'question';
};
