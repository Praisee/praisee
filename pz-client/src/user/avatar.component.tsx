import { Component } from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import appInfo from 'pz-client/src/app/app-info';
import SchemaInjector, { ISchemaType } from 'pz-client/src/support/schema-injector';
import ToggleTrustMutation from 'pz-client/src/user/toggle-trust-mutation';
import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import handleClick from 'pz-client/src/support/handle-click';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';

const unknownAvatarUrl = appInfo.addresses.getImage('unknown-avatar.png');

class Avatar extends Component<IAvatarProps, any>{
    schemaInjector: SchemaInjector;
    user: IUser;

    static contextTypes: any = {
        appViewerId: React.PropTypes.string.isRequired,
        signInUpContext: SignInUpContextType
    };

    context: {
        appViewerId: number,
        signInUpContext: ISignInUpContext
    };

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(avatarSchema);
    }

    render() {
        return this.schemaInjector.inject(
            <div className="avatar">
                {this._renderImage()}

                <div className="avatar-name-container">
                    <span className="display-name">{this._getUser().displayName}</span>
                    <div className="avatar-stats">
                        {this._renderReputation()}
                        {this._renderTrust()}
                    </div>
                </div>

                {this._renderTrustButton()}
            </div>
        );
    }

    private _getUser() {
        return (this.props.communityItem || this.props.comment).user;
    }

    private _renderReputation() {
        const {reputation} = this._getUser();

        if (this.props.showReputation)
            return (
                <span className="reputation" title="This user is the highest rated in this topic.">
                    {reputation || 0}

                    <i className="reputation-icon"></i>
                </span>
            );
    }

    private _renderTrust() {
        const {trusterCount, displayName} = this._getUser();
        const singular = trusterCount === 1;

        const hint = `${trusterCount} ${singular ? "person" : "people"} trust${singular ? "s" : ""} ${displayName}`;

        if (this.props.showTrusts) {
            return (
                <span className="trusters" title={hint}>
                    {trusterCount || 0}

                    <i className="trusters-icon"></i>
                </span>
            );
        }
    }

    private _renderTrustButton() {
        const {isCurrentUserTrusting, isCurrentUser} = this._getUser();

        if (isCurrentUser) {
            return;
        }

        if (!this.props.showTrustButton) {
            return;
        }

        return (
            <button className="trust-button" title="Trust this user"
                    onClick={handleClick(this._toggleTrust.bind(this))}>

                <i className="trust-button-icon"></i>

                {isCurrentUserTrusting ? "Trusted" : "Trust"}
            </button>
        );
    }

    private _renderImage() {
        const {isCurrentUser, image} = this._getUser();

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

    private _toggleTrust() {
        if (!this.context.signInUpContext.isLoggedIn()) {
            GoogleTagManager.triggerAttemptedTrust();

            this.context.signInUpContext.showSignInUp();
            return;
        }

        GoogleTagManager.triggerTrust();

        const parent = this.props.communityItem || this.props.comment;

        this.props.relay.commitUpdate(new ToggleTrustMutation({
            user: parent.user
        }));
    }

    private _loadDefaultImage(event) {
        event.target.src = unknownAvatarUrl;
    }
}

var otherUserFragment = Relay.QL`
  fragment on OtherUser {
        isCurrentUserTrusting
    }
 `;

var userFragment = Relay.QL`
    fragment on UserInterface {
        isCurrentUser
        displayName
        reputation
        trusterCount
        image
        ${otherUserFragment}
    }
`;

export default Relay.createContainer(Avatar, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItemInterface {
                user{
                    ${ToggleTrustMutation.getFragment('user')}
                    ${userFragment}
                }
            }
        `,
        comment: () => Relay.QL`
            fragment on Comment{
                user{
                    ${ToggleTrustMutation.getFragment('user')}
                    ${userFragment}
                }
            }
        `
    }
});

interface IUser {
    isCurrentUser: boolean;
    displayName: string;
    reputation: number;
    image: string;
    trusterCount: number;
    isCurrentUserTrusting?: boolean
}

export interface IAvatarProps {
    communityItem: { user: IUser };
    comment: { user: IUser };
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
