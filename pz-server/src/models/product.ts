import {ITopicModel} from 'pz-server/src/models/topic';

module.exports = function (Product: ITopicModel) {
    Product.type = 'product';
};
