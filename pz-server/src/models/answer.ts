import {ICommunityItem} from 'pz-server/src/models/community-item';

module.exports = function (Answer: ICommunityItem) {
    Answer.type = 'answer';
};
