import {ICommunityItem} from 'pz-domain/src/models/community-item';

module.exports = function (Question: ICommunityItem) {
    Question.type = 'question';
};
