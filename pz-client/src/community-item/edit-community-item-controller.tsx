import * as React from 'react';
import { Component } from 'react';
import * as Relay from 'react-relay';
import Votes from 'pz-client/src/votes/votes-component';
import Avatar from 'pz-client/src/user/avatar.component';
import { CreateCommentEditor } from 'pz-client/src/comments/comment-editor-component';
import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import classNames from 'classnames';
import CommunityItemBodyEditor from 'pz-client/src/community-item/community-item-body-editor.component';
import handleClick from 'pz-client/src/support/handle-click';
import serializeEditorState from '../editor/serialize-editor-state';
import UpdateCommunityItemContentMutation from 'pz-client/src/community-item/update-community-item-content-mutation';
import {withRouter, Link} from 'react-router';

interface IContext {
    showNotFoundError: any
}

export class CommunityItemController extends Component<ICommunityItemProps, any> {
    static contextTypes: React.ValidationMap<any> = {
        showNotFoundError: React.PropTypes.func.isRequired,
        appViewerId: React.PropTypes.string.isRequired,
        signInUpContext: SignInUpContextType
    };

    context: {
        showNotFoundError: Function,
        appViewerId: number,
        signInUpContext: ISignInUpContext
    };

    state = {
        updatedSummary: null,
        updatedBody: null
    };

    render() {
        if (!this.props.communityItem || !this.props.communityItem.belongsToCurrentUser) {
            this.context.showNotFoundError();
            return <span />;
        }

        return (
            <div className="edit-community-item-namespace" >
                <div className="community-item">
                    {this._renderDiscardControl()}

                    {this._renderSummary()}

                    {this._renderCommunityItemBodyEditor()}

                    {this._renderEditorControls()}
                </div>
            </div>
        )
    }

    private _renderDiscardControl() {
        return (
            <div className="discard-control-container">
                <Link to={this.props.communityItem.routePath}
                   className="discard-link">Discard changes</Link>
            </div>
        );
    }

    private _renderSummary() {
        const summary = this.state.updatedSummary || this.props.communityItem.summary;

        return (
            <div className="community-item-title-container">
                <input
                    className="community-item-title-input"
                    type="text"
                    value={summary}
                    onChange={(event: any) => this.setState({updatedSummary: event.target.value})}
                />
            </div>
        );
    }

    private _renderCommunityItemBodyEditor() {
        return (
            <CommunityItemBodyEditor
                className="community-item-body-editor"
                placeholder="Elaborate here if you wish..."
                initialRawContentState={this.props.communityItem.bodyData}
                onChange={(editorState) => this.setState({updatedBody: editorState})}
            />
        );
    }

    private _renderEditorControls() {
        const onSave = handleClick(this._updateCommunityItemContent.bind(this));

        return (
            <div className="community-item-editor-controls">
                <button className="save-community-item-button" onClick={onSave}>
                    Save
                </button>
            </div>
        );
    }

    private _updateCommunityItemContent() {
        const summary = this.state.updatedSummary || this.props.communityItem.summary;

        const bodyData = this.state.updatedBody ?
            serializeEditorState(this.state.updatedBody) : this.props.communityItem.bodyData;

        const mutation = new UpdateCommunityItemContentMutation({
            viewer: this.props.viewer,
            communityItem: this.props.communityItem,
            summary,
            bodyData
        });

        this.props.relay.commitUpdate(
            mutation,
            {
                onSuccess: this._redirectOnSuccess.bind(this)
            }
        );
    }

    private _redirectOnSuccess(response) {
        this.setState({isEditingCommunityItem: false});

        const redirectPath = (
            response
            && response.updateCommunityItemContent
            && response.updateCommunityItemContent.viewer
            && response.updateCommunityItemContent.viewer.lastCreatedCommunityItem
            && response.updateCommunityItemContent.viewer.lastCreatedCommunityItem.routePath
        );

        if (redirectPath) {
            this.props.router.push(redirectPath);
        }
    }
}

export default Relay.createContainer(withRouter(CommunityItemController), {
    initialVariables: {
        expandCommentsTo: 10,
        expandComments: true
    },
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                lastCreatedCommunityItem {
                    routePath
                }
                
                ${UpdateCommunityItemContentMutation.getFragment('viewer')}
            }
        `,

        communityItem: ({expandCommentsTo, expandComments}) => Relay.QL`
            fragment on CommunityItemInterface {
                summary
                body
                bodyData
                user {
                    displayName
                }
                topics {
                    id
                    name
                    routePath
                }
                belongsToCurrentUser
                routePath
                
                ${Avatar.getFragment('communityItem')}
                ${CreateCommentEditor.getFragment('communityItem')}
                ${UpdateCommunityItemContentMutation.getFragment('communityItem')}
            }
        `
    }
});

interface ICommunityItemProps {
    params;
    viewer;
    communityItem?;
    relay;

    router: {
        push: Function
    }
}
