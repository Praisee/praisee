import * as React from 'react';
import Editor from 'pz-client/src/editor/editor.component';
import appInfo from 'pz-client/src/app/app-info';
import XhrSingleFileUploadRequester from 'pz-client/src/support/file-upload-requester';
import {ISignInUpContext, SignInUpContextType} from 'pz-client/src/user/sign-in-up-overlay-component';
import {
    AddPhotoButton,
    EmbedVideoButton
} from 'pz-client/src/editor/content-menu/content-menu-buttons-component';

import {
    createAttachmentPlugin,
    insertAttachmentLoader
} from 'pz-client/src/editor/attachment-plugin/attachment-plugin';

import {IPhotoAttachment} from 'pz-client/src/editor/attachment-plugin/attachment';
import {IFileUploadResponse} from 'pz-client/src/support/file-upload-requester';
import {FixedContentMenu} from 'pz-client/src/editor/content-menu/content-menu-components';

import prependText from 'pz-client/src/editor/editor-state/prepend-text';

export interface IProps {
    placeholder?: any
    initialRawContentState?: any
    onChange?: (editorState) => any
    onBlur?: () => any
    onFocus?: () => any
    className?: string
    headerContent?: any
    footerContent?: any
}

export default class CommunityItemEditor extends React.Component<IProps, any> {
    static contextTypes: any = {
        signInUpContext: SignInUpContextType,
    };

    context: {
        signInUpContext: ISignInUpContext
    };

    private _editorPlugins = [
        createAttachmentPlugin()
    ];

    private _fileUploadRequester = new XhrSingleFileUploadRequester({
        url: appInfo.addresses.getCommunityItemPhotoUploadApi(),
        method: 'post',
        fieldName: 'photoFile'
    });

    state = {
        editorState: null
    };

    refs: {
        editor: any
    };

    focus() {
        this.refs.editor.focus();
    }

    prependText(text: string) {
        const editorState = prependText(this.state.editorState, text);
        this._updateEditorState(editorState);
    }

    render() {
        return (
            <div className="community-item-body-editor">
                <FixedContentMenu>
                    {this._renderContentMenuButtons()}
                </FixedContentMenu>

                <div className="editor-container">
                    <div className="editor-header">
                        {this.props.headerContent}
                    </div>

                    <Editor
                        {...this.props}
                        editorState={this.state.editorState}
                        onChange={this._updateEditorState.bind(this)}
                        plugins={this._editorPlugins}
                        ref="editor"
                    />

                    <div className="editor-footer">
                        {this.props.footerContent}
                    </div>
                </div>
            </div>
        );
    }

    private _updateEditorState(editorState) {
        this.setState({editorState});
        this.props.onChange(editorState);
    }

    private _renderContentMenuButtons() {
        return (
            <div className="community-item-editor-menu">
                {this._renderAddPhotoButton()}
                {this._renderEmbedVideoButton()}
            </div>
        );
    }

    private _renderAddPhotoButton() {
        if (!this.context.signInUpContext.isLoggedIn) {
            return;
        }

        return (
            <AddPhotoButton
                onPhotoUploadRequested={this._uploadPhoto.bind(this)}
            />
        );
    }

    private _renderEmbedVideoButton() {
        return (
            <EmbedVideoButton
                editorState={this.state.editorState}
                onChange={this._updateEditorState.bind(this)}
            />
        );
    }

    private _uploadPhoto(photo) {
        const status = this._fileUploadRequester.send(photo);
        const photoPromise = status.toPromise();

        const [editorState, loadingEditorState] = insertAttachmentLoader(
            this.state.editorState,
            photoPromise.then((uploadResponse) => this._photoUploadToAttachment(uploadResponse))
        );

        this.setState({editorState});

        loadingEditorState.then(editorState => {
            this.setState({editorState});
        });
    }

    private _photoUploadToAttachment(uploadResponse: IFileUploadResponse): IPhotoAttachment {
        if (uploadResponse.statusCode !== 200) {
            throw new Error('Failed to upload photo:' + uploadResponse);
        }

        return Object.assign({
            attachmentType: 'Photo',
            id: uploadResponse.body.photoId
        }, uploadResponse.body.photoUrls);
    }
}

