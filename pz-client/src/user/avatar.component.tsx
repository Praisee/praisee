import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import appInfo from 'pz-client/src/app/app-info';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component'

const unknownAvatarUrl = appInfo.addresses.getImage('unknown-avatar.png');

class Avatar extends Component<IAvatarProps, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(avatarSchema);
    }

    render() {
        const parent = this.props.communityItem || this.props.comment;
        const {image, displayName, reputation} = parent.user;

        return this.schemaInjector.inject(
            <div className="avatar">
                <img className="avatar-image" src={image || unknownAvatarUrl} />
                <span className="display-name">{displayName}</span>
                <span className="reputation" title="This user is the highest rated in this topic.">
                    {reputation || 0}
                    <i className="reputation-icon"></i>
                </span>
            </div>
        );
    }
}

export default Relay.createContainer(Avatar, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItem{
                user {
                    displayName,
                    reputation,
                    image
                }
            }
        `,
        comment: () => Relay.QL`
            fragment on Comment{
                user {
                    displayName,
                    reputation,
                    image
                }
            }
        `
    }
});

export interface IAvatarProps {
    communityItem: any;
    comment: any;
    displayName: string;
    reputation: number;
    image: string;
}

var avatarSchema: ISchemaType = {
    "author": {
        property: "author",
        typeof: "Person"
    },
    "name": {
        property: "name"
    },
    "image":
    {
        property: "downvoteCount",
        typeof: "AggregateRating"
    }
}
