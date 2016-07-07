import {ICommunityItem} from 'pz-server/src/models/community-item';

module.exports = function (Question: ICommunityItem) {
    Question.type = 'question';
};
