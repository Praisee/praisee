import {ICommunityItem} from 'pz-domain/src/models/community-item';

module.exports = function (Comment: ICommunityItem) {
    Comment.type = 'comment';
};
