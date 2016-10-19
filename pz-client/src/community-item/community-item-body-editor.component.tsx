import * as React from 'react';
import Editor from 'pz-client/src/editor/editor.component';
import appInfo from 'pz-client/src/app/app-info';
import XhrSingleFileUploadRequester from 'pz-client/src/support/file-upload-requester';
import {
    AddPhotoButton,
    AddHeading1Button,
    AddHeading2Button
} from 'pz-client/src/editor/content-menu/content-menu-buttons.component';

import {
    createAttachmentPlugin,
    insertAttachmentLoader
} from 'pz-client/src/editor/attachment-plugin/attachment-plugin';

import {IPhotoAttachment} from 'pz-client/src/editor/attachment-plugin/attachment';
import {IFileUploadResponse} from 'pz-client/src/support/file-upload-requester';

export interface IProps {
    placeholder?: any
    initialRawContentState?: any
    onChange?: (editorState) => any
    onBlur?: () => any
    onFocus?: () => any
    className?: string
}

export default class CommunityItemEditor extends React.Component<IProps, any> {
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

    focus() {
        (this.refs as any).editor.focus();
    }

    render() {
        return (
            <Editor
                {...this.props}
                editorState={this.state.editorState}
                onChange={this._updateEditorState.bind(this)}
                plugins={this._editorPlugins}
                contentMenuButtons={this._renderContentMenuButtons()}
                ref="editor"
            />
        );
    }

    private _updateEditorState(editorState) {
        this.setState({editorState});
        this.props.onChange(editorState);
    }

    private _renderContentMenuButtons() {
        return (
            <div className="community-item-editor-menu">
                <AddPhotoButton
                    onPhotoUploadRequested={this._uploadPhoto.bind(this)}
                />

                <AddHeading1Button
                    editorState={this.state.editorState}
                    onChange={this._updateEditorState.bind(this)}
                />

                <AddHeading2Button
                    editorState={this.state.editorState}
                    onChange={this._updateEditorState.bind(this)}
                />
            </div>
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

