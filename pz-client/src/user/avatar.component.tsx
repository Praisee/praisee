import * as React from 'react';
import * as Relay from 'react-relay';
import { Component } from 'react';
import { Link } from 'react-router';
import appInfo from 'pz-client/src/app/app-info';
import SchemaInjector, { ISchemaType } from 'pz-client/src/support/schema-injector';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';
import TrustButton from 'pz-client/src/user/trust-button';
import TrustReputationStats from 'pz-client/src/user/trust-reputation-stats';
var AvatarImage = require('react-avatar');

class Avatar extends Component<IAvatarProps, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(avatarSchema);
    }

    render() {
        const {avatarInfo, displayName} = this.props.user;
        const {facebookId, googleId, emailHash} = avatarInfo;

        return this.schemaInjector.inject(
            <div className="avatar">
                <div className="avatar-image-container">
                    <AvatarImage
                        size={40}
                        facebookId={facebookId}
                        googleId={googleId}
                        md5email={emailHash}
                        name={displayName}
                        round={true}
                        />
                </div>

                <div className="avatar-name-container">
                    <Link to={this.props.user.routePath}
                        className="display-name">

                        {this.props.user.displayName}
                    </Link>
                    <TrustReputationStats
                        showReputation={this.props.showReputation}
                        showTrusts={this.props.showTrusts}
                        user={this.props.user} />
                </div>

                <TrustButton user={this.props.user} />
            </div>
        );
    }
}

export default Relay.createContainer(Avatar, {
    fragments: {
        user: () => Relay.QL`
            fragment on UserInterface {
                displayName
                routePath
                avatarInfo {
                    facebookId
                    googleId
                    emailHash
                }
                ${TrustButton.getFragment('user')}
                ${TrustReputationStats.getFragment('user')}
            }
        `
    }
});

interface IUser {
    displayName: string;
    routePath: string;
    avatarInfo: {
        facebookId: string;
        googleId: string;
        emailHash: string;
    }
}

export interface IAvatarProps {
    user: IUser;
    showReputation: boolean;
    showTrusts: boolean;
    showTrustButton: boolean;
    relay: any;
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
