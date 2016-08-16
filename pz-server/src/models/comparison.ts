import {ICommunityItemModel} from 'pz-server/src/models/community-item';

module.exports = function (Comparison: ICommunityItemModel) {
    Comparison.type = 'comparison';
};
