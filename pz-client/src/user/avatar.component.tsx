import { Component } from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import appInfo from 'pz-client/src/app/app-info';
import SchemaInjector, { ISchemaType } from 'pz-client/src/support/schema-injector';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component'
import ToggleTrustMutation from 'pz-client/src/user/toggle-trust-mutation';

const unknownAvatarUrl = appInfo.addresses.getImage('unknown-avatar.png');

class Avatar extends Component<IAvatarProps, any>{
    schemaInjector: SchemaInjector;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(avatarSchema);
    }

    render() {
        const parent = this.props.communityItem || this.props.comment;
        const {image, displayName, reputation, trusterCount} = parent.user;
        const {isCurrentUserTrusting} = parent.user;

        return this.schemaInjector.inject(
            <div className="avatar">
                <img className="avatar-image" src={image || unknownAvatarUrl} />
                <span className="display-name">{displayName}</span>
                {this._renderReputation(reputation)}
                {this._renderTrust(trusterCount, displayName)}
                {this._renderTrustButton(isCurrentUserTrusting)}
            </div>
        );
    }
    
    private _renderReputation(reputation: number){
        if(this.props.showReputation)
        return(
                <span className="reputation" title="This user is the highest rated in this topic.">
                    {reputation || 0}
                    <i className="reputation-icon"></i>
                </span>
        );
    }

    private _renderTrust(trusterCount: number, displayName: string){
        var singular = trusterCount === 1;
        if(this.props.showTrusts)
        return(
                <span className="trusters"
title={`${trusterCount} ${singular ? "person" : "people"} trust${singular && "s"} ${displayName}`} >
                    {trusterCount || 0}
                    <i className="trusters-icon"></i>
                </span>
        );
    }
    
    private _renderTrustButton(isCurrentUserTrusting: boolean){
        if(this.props.showTrustButton)
        return(
                <button className="trust-button" title="Trust this user" onClick={this._toggleTrust.bind(this)}>
                    <i className="trust-button-icon"></i>
                    {isCurrentUserTrusting ? "Trusted" : "Trust"}
                </button>
        );
    }
    
    private _toggleTrust() {
        const parent = this.props.communityItem || this.props.comment;

        this.props.relay.commitUpdate(new ToggleTrustMutation({
            user: parent.user
        }));
    }
}

var otherUserFragment = Relay.QL`
  fragment on OtherUser {
    isCurrentUserTrusting
  }
`;

var userFragment = Relay.QL`
    fragment on UserInterface {
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
            fragment on CommunityItem {
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
