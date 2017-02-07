import { IUserActivityStats } from 'pz-server/src/users/users';
import { App } from '../app/app.controller';
import { browserHistory } from 'react-router';
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
import UpdateUserMutation from 'pz-client/src/user/update-user-mutation';
// import Avatar from 'react-avatar';
var Avatar = require('react-avatar');

export class Profile extends Component<IProfileControllerProps, IProfileControllerState> {
    constructor(props, state) {
        super(props, state);
        this.state = {
            isEditingName: false,
            isEditingBio: false,
            displayName: this.props.profile.user.displayName,
            bio: this.props.profile.bio || ""
        };
    }

    componentWillReceiveProps(nextProps) {
        /*
            TODO:
            Cant edit name on user created from facebook - fat query doesnt ask for routePath... FUCKIN WAHT!H!!!?!
            Add photos to contributions
            Add ability to upload and crop photo
        */

        if (this.props.profile.user.id == nextProps.profile.user.id) {
            return;
        }

        this.setState({
            isEditingName: false,
            isEditingBio: false,
            displayName: nextProps.profile.user.displayName,
            bio: nextProps.profile.bio || ""
        });
    }

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
        const {createdAt, user} = this.props.profile;
        const {facebookId, googleId, emailHash} = this.props.profile.user.avatarInfo;
        const {displayName, image} = user;
        const memberSince = new Date(createdAt);

        return (
            <div className="profile-top-section">
                <div className="profile-top-left">
                    <Avatar
                        size={150}
                        facebookId={facebookId}
                        googleId={googleId}
                        md5email={emailHash}
                        name={displayName}
                        round={true}
                    />

                    <TrustReputationStats user={user} showReputation={true} showTrusts={true} />
                </div>

                <div className="profile-top-right">
                    <TrustButton user={user} />

                    {this._renderName()}

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

    private _renderName() {
        if (this.state.isEditingName) {
            return (
                <div>
                    <input
                        type="text"
                        className='name-editor'
                        value={this.state.displayName}
                        onChange={this._handleNameChanging}
                        onBlur={this._handleNameChangeSubmit}
                        autoFocus={true} />
                </div>
            )
        } else {
            return (
                <h1 className="name"
                    onClick={() => this._editIfMine('Name')}>

                    {this.state.displayName}

                    {
                        this.props.profile.user.isCurrentUser && <i className='edit-icon'
                            onClick={this._editName}
                            title="Edit your name"
                        />
                    }
                </h1>
            )
        }
    }

    private _renderBio() {
        let {isCurrentUser} = this.props.profile.user;
        let {bio} = this.props.profile;

        if (this.state.isEditingBio) {
            return (
                <div>
                    <textarea
                        type="text"
                        className='bio-editor'
                        rows={8}
                        value={this.state.bio}
                        onChange={this._handleBioChanging}
                        onBlur={this._handleBioChangeSubmit}
                        autoFocus={true}
                    />
                </div>
            );
        }
        else {

            return (
                <div className="bio">
                    {
                        isCurrentUser &&
                        <i className='edit-icon'
                            onClick={this._editBio}
                            title="Edit your bio"
                        />
                    }
                    <ContentTruncator truncateToHeight={150} heightMargin={25}>
                        {this._isEmpty(bio) && isCurrentUser
                            ? <i onClick={() => this._editIfMine('Bio')}>
                                It looks like your bio is empty! Let everyone know a little about yourself.
                              </i>
                            : <p onClick={() => this._editIfMine('Bio')}>{bio}</p>
                        }
                    </ContentTruncator>

                </div>
            );
        }
    }

    private _renderSummarySection() {
        const {comments, communityItems, upVotes, downVotes, reputation, trusts} = this.props.profile.activityStats;
        const {displayName} = this.props.profile.user;

        return (
            <div className="summary-section">
                <div className="summary-section-row">
                    <span className="summary-section-title"
                        title={`${displayName}'s Activity over the past 30 days`}>
                        Activity
                    </span>
                    <div className="summary-section-contents">
                        {this._renderSummaryItem("comments", comments,
                            `How many comments ${displayName} has written in the past 30 days`)}
                        {this._renderSummaryItem("posts", communityItems,
                            `How many posts (reviews, questions, discussion items) ${displayName} has written in the past 30 days`)}
                        {this._renderSummaryItem("upvotes", upVotes,
                            `How many times ${displayName} was up voted in the past 30 days`)}
                        {this._renderSummaryItem("downvotes", downVotes,
                            `How many times ${displayName} was down voted in the past 30 days`)}
                        {this._renderSummaryItem("reputation", reputation,
                            `How much reptuation ${displayName} has earned in the past 30 days`)}
                        {this._renderSummaryItem("trusters", trusts,
                            `How many trusters ${displayName} has gained in the past 30 days`)}
                    </div>
                </div>
                {/*
                <div className="summary-section-row">
                    <span className="summary-section-title" 
                        title=`The awards ${displayName} has earned`>
                        Awards
                    </span>
                    <div className="summary-section-contents">
                    </div>
                </div>
*/}
            </div>
        );
    }

    private _renderSummaryItem(type: string, count: number, hintText: string) {
        return (
            <div className="summary-item" title={hintText}>
                <span className="summary-badge">{count}</span>
                {type}
            </div>
        );
    }

    private _renderContributionsSection() {
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
            <div className="contributions-section">
                {rows}
                {expandButton}
            </div>
        );
    }

    private _handleNameChangeSubmit = () => {
        const onSuccess = (mutationPayload?) => {
            if (mutationPayload) {
                browserHistory.replace(mutationPayload.updateUser.user.routePath);
            }

            this.setState({ isEditingName: false });
        }

        if (this.props.profile.user.displayName === this.state.displayName.trim()) {
            return onSuccess();
        }

        this._submitUserChangeMutation(onSuccess);
    }

    private _handleBioChangeSubmit = () => {
        const onSuccess = () => this.setState({ isEditingBio: false });
        const modifiedBio = this.state.bio.trim();
        const originalBio = this.props.profile.bio.trim();

        const bioChanged = originalBio !== modifiedBio
            || (originalBio === null && modifiedBio === '')

        if (!bioChanged) {
            return onSuccess();
        }

        this._submitUserChangeMutation(onSuccess);
    }

    private _submitUserChangeMutation(success: Function, failure?: Function) {
        this.props.relay.commitUpdate(
            new UpdateUserMutation({
                profile: this.props.profile,
                displayName: this.state.displayName.trim(),
                bio: this.state.bio.trim()
            }), {
                onSuccess: (payload) => {
                    success && success(payload);
                },
                onFailure: () => {
                    //TODO: Local error handling
                    failure && failure();
                }
            }
        );
    }

    private _handleBioChanging = event => this.setState({ bio: event.target.value });

    private _handleNameChanging = event => this.setState({ displayName: event.target.value });

    private _editIfMine = field =>
        this.props.profile.user.isCurrentUser && this.setState({ [`isEditing${field}`]: true });

    private _editBio = () => this.setState({ isEditingBio: true });

    private _editName = () => this.setState({ isEditingName: true });

    private _showMoreCommunityItems() {
        this.props.relay.setVariables({ limit: this.props.relay.variables.limit + 5 })
    }

    private _isEmpty(str: string): boolean {
        return str === null || typeof (str) === 'undefined' || str.trim() === '';
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
                ${UpdateUserMutation.getFragment('profile')}
                
                user {
                    id
                    displayName
                    isCurrentUser
                    routePath
                    avatarInfo {
                        facebookId
                        googleId
                        emailHash
                    }
                    ${TrustButton.getFragment('user')}
                    ${TrustReputationStats.getFragment('user')}
                }

                activityStats {
                    communityItems
                    comments
                    upVotes
                    downVotes
                    trusts
                    reputation
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

interface IProfileControllerProps {
    profile: {
        bio: string;
        createdAt: string;
        user: {
            id: string;
            displayName: string;
            image: string;
            isCurrentUser: boolean;
            avatarInfo: {
                facebookId: string;
                googleId: string;
                emailHash: string;
            }
        }
        activityStats: {
            comments: number;
            communityItems: number;
            downVotes: number;
            upVotes: number;
            trusts: number;
            reputation: number;
        }
        communityItems: any;
        communityItemCount: any;
    }

    relay: any;
}

interface IProfileControllerState {
    isEditingName?: boolean;
    isEditingBio?: boolean;
    displayName?: string;
    bio?: string;
}
