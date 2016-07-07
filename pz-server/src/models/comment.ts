import {ICommunityItem} from 'pz-server/src/models/community-item';

module.exports = function (Comment: ICommunityItem) {
    Comment.type = 'comment';
};
