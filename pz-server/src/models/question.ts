import {ICommunityItemInstance} from 'pz-server/src/models/community-item';

module.exports = function (Question: ICommunityItemInstance) {
    Question.type = 'question';
};
