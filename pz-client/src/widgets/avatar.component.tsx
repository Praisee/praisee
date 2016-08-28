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
        const {image, name, reputation} = this.props;
        
        return this.schemaInjector.inject(
            <div className="avatar">
            <h3>{name}</h3>
                <p>
                    <img className="image" src={image} />
                    <span className="reputation">{reputation}</span>
                </p>
            </div>
        );
    }
}

export default Relay.createContainer(Avatar, {
    fragments: {
        // votes: ()=> Relay.QL`
        //     fragment on Author {
        //         name,
        //         reputation,
        //         image
        //     }
        // `
    }
});

export interface IAvatarProps {
    name: string,
    reputation: number,
    image: string
}

var avatarSchema: ISchemaType = {
    "author":{
        property: "author",
        typeof: "Person"
    },
    "name":{
        property: "name"
    },
    "image":
    {
        property: "downvoteCount",
        typeof: "AggregateRating"
    }
}