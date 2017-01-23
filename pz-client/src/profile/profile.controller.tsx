import { App } from '../app/app.controller';
import * as React from 'react';
import * as Relay from 'react-relay';
import { Component } from 'react';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component'
import appInfo from 'pz-client/src/app/app-info';
import TrustButton from 'pz-client/src/user/trust-button';
import TrustReputationStats from 'pz-client/src/user/trust-reputation-stats';
import ContentTruncator from 'pz-client/src/widgets/content-truncator-component';
import ExpandButton from 'pz-client/src/widgets/expand-button-component';
import CommunityItem from 'pz-client/src/community-item/community-item-component';

export interface IProfileControllerProps {
    profile: {
        bio: string;
        createdAt: string;
        user: {
            displayName: string;
            image: string;
        }
        communityItems: any;
        communityItemCount: any;
    }

    relay: any;
}

const unknownAvatarUrl = appInfo.addresses.getImage('unknown-avatar.png');

export class Profile extends Component<IProfileControllerProps, any> {
    render() {

        return (
            <div className="profile-namespace">
                {this._renderTopSection()}
                {this._renderSummarySection()}
                {this._renderContributionsSection()}
            </div>
        );
    }

    private _renderTopSection() {
        let {createdAt, user} = this.props.profile;
        let {displayName, image} = user;
        let memberSince = new Date(createdAt);

        return (
            <div className="profile-top-section">
                <div className="profile-top-left">
                    <img className="avatar-image"
                        src={`${image}?d=retro`}
                        onError={this._loadDefaultImage.bind(this)}
                        />

                    <TrustReputationStats user={user} showReputation={true} showTrusts={true} />
                </div>

                <div className="profile-top-right">
                    <TrustButton user={user} />

                    <h1 className="name">{displayName}</h1>

                    <div className="member-since">
                        Praisee member since <DateDisplay
                            date={createdAt}
                            type="date-created"
                            style={{ display: "inline-block" }}
                            format="MM-DD-YYYY"
                            />
                    </div>

                    {this._renderBio()}
                </div>
            </div>
        )
    }

    private _renderBio() {
        let {bio} = this.props.profile;

        return (
            <div className="bio">
                <ContentTruncator truncateToHeight={100} heightMargin={50}>
                    {bio}
                </ContentTruncator>
            </div>
        );
    }

    private _renderSummarySection() {
        return (
            <div className="summary-section">
                <div className="summary-section-row">
                    <span className="summary-section-title">Activity</span>
                    <div className="summary-section-contents">
                        {this._renderSummaryItem("comments")}
                        {this._renderSummaryItem("upvotes")}
                        {this._renderSummaryItem("downvotes")}
                        {this._renderSummaryItem("reputation")}
                        {this._renderSummaryItem("trusters")}
                    </div>
                </div>
                <div className="summary-section-row">
                    <span className="summary-section-title">Awards</span>
                    <div className="summary-section-contents">
                        {this._renderSummaryItem("comments")}
                        {this._renderSummaryItem("upvotes")}
                        {this._renderSummaryItem("downvotes")}
                        {this._renderSummaryItem("reputation")}
                    </div>
                </div>
            </div>
        );
    }

    private _renderSummaryItem(type) {
        //TODO: Pull this from db
        // const count = this.props[type].count;
        let count = Math.floor(Math.random() * 100);

        return (
            <div className="summary-item">
                <span className="summary-badge">{count}</span>
                {type}
            </div>
        );
    }

    private _renderContributionsSection() {
        return (
            <div className="contributions-section">
                <h1 className="section-title">
                    Contributions - <span>{this.props.profile.communityItems.edges.length}</span>
                </h1> 
                {this._renderContributions()}
            </div>
        )
    }

    private _loadDefaultImage(event) {
        event.target.src = unknownAvatarUrl;
    }

    private _renderContributions() {
        const rows = this.props.profile.communityItems.edges
            .map(({node}) =>
                <CommunityItem
                    key={node.id}
                    communityItem={node}
                    truncateLongContent={true}
                    linkShouldOpenInTab={true}
                    />
            );

        let expandButton = null;
        const canExpand = this.props.profile.communityItemCount > this.props.relay.variables.limit;
        if (canExpand) {
            expandButton = (
                <ExpandButton
                    className="show-more-community-items"
                    onExpand={this._showMoreCommunityItems.bind(this)}
                    isExpanded={!canExpand}
                    />
            )
        }

        return (
            <div>
                {rows}
                {expandButton}
            </div>
        );
    }

    private _showMoreCommunityItems() {
        this.props.relay.setVariables({ limit: this.props.relay.variables.limit + 5 })
    }
}

export default Relay.createContainer(Profile, {
    initialVariables: {
        limit: 5
    },
    fragments: {
        profile: () => Relay.QL`
            fragment on UserProfile {
                bio
                createdAt
                user {
                    displayName
                    image
                    ${TrustButton.getFragment('user')}
                    ${TrustReputationStats.getFragment('user')}
                }

                communityItemCount
                communityItems(first: $limit) {
                    edges {
                        node{
                            id,
                            ${CommunityItem.getFragment('communityItem')}
                        }
                    }
                }
            }
        `
    }
});
