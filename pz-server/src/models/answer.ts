import {ICommunityItemInstance} from 'pz-server/src/models/community-item';

module.exports = function (Answer: ICommunityItemInstance) {
    Answer.type = 'answer';
};
