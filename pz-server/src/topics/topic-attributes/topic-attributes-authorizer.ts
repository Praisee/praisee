import {
    ITopicAttributes,
    ITopicAttribute
} from 'pz-server/src/topics/topic-attributes/topic-attributes';

import {authorizer} from 'pz-server/src/support/authorization';
import {TOptionalUser} from 'pz-server/src/users/users';

export interface IAuthorizedTopicAttributes {
    findById(id: number): Promise<ITopicAttribute>
    findAllByTopicId(topicId: number): Promise<Array<ITopicAttribute>>
}

class AuthorizedTopicAttributes implements IAuthorizedTopicAttributes {
    private _user: TOptionalUser;
    private _topicAttributes: ITopicAttributes;

    constructor(user: TOptionalUser, topicAttributes: ITopicAttributes) {
        this._user = user;
        this._topicAttributes = topicAttributes;
    }

    findById(id: number): Promise<ITopicAttribute> {
        return this._topicAttributes.findById(id);
    }

    findAllByTopicId(topicId: number): Promise<Array<ITopicAttribute>> {
        return this._topicAttributes.findAllByTopicId(topicId);
    }
}

export default authorizer<IAuthorizedTopicAttributes>(AuthorizedTopicAttributes);
