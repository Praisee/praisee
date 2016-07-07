import {ICommunityItem} from 'pz-server/src/models/community-item';

module.exports = function (Comparison: ICommunityItem) {
    Comparison.type = 'comparison';
};
