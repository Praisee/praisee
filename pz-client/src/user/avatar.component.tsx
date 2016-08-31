import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component'

class Avatar extends Component<IAvatarProps, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(avatarSchema);
    }

    render() {
        const {image, displayName, reputation} = this.props.communityItem.user;

        return this.schemaInjector.inject(
            <div className="avatar">
                <img className="image" src={image || "/unknown.png"} />
                <strong>{displayName}</strong>
                <span className="reputation">{reputation || 0}</span>
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