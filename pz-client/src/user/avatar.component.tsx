import * as React from 'react';
import * as Relay from 'react-relay';
import { Component } from 'react';
import { Link } from 'react-router';
import appInfo from 'pz-client/src/app/app-info';
import SchemaInjector, { ISchemaType } from 'pz-client/src/support/schema-injector';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';
import TrustButton from 'pz-client/src/user/trust-button';
import TrustReputationStats from 'pz-client/src/user/trust-reputation-stats';

const unknownAvatarUrl = appInfo.addresses.getImage('unknown-avatar.png');

class Avatar extends Component<IAvatarProps, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(avatarSchema);
    }

    render() {
        return this.schemaInjector.inject(
            <div className="avatar">
                {this._renderImage()}

                <div className="avatar-name-container">
                    <Link to={this.props.user.routePath}
                        className="display-name">{this.props.user.displayName}
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

    private _renderImage() {
        const {isCurrentUser, image} = this.props.user;

        if (isCurrentUser) {
            return (
                <a href="https://gravatar.com" target="blank">
                    <div className="avatar-image-container avatar-image-container-is-mine">
                        <img className="avatar-image"
                            src={`${image}?d=retro`}
                            onError={this._loadDefaultImage.bind(this)} />
                    </div>
                </a>
            );
        }

        else {
            return (
                <div className="avatar-image-container">
                    <img className="avatar-image"
                        src={`${image}?d=retro`}
                        onError={this._loadDefaultImage.bind(this)} />
                </div>
            );
        }
    }

    private _loadDefaultImage(event) {
        event.target.src = unknownAvatarUrl;
    }
}

export default Relay.createContainer(Avatar, {
    fragments: {
        user: () => Relay.QL`
            fragment on UserInterface {
                isCurrentUser
                displayName
                image
                routePath
                ${TrustButton.getFragment('user')}
                ${TrustReputationStats.getFragment('user')}
            }
        `
    }
});

interface IUser {
    isCurrentUser: boolean;
    displayName: string;
    image: string;
    routePath: string;
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
