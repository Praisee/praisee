import * as React from 'react';
import CustomizableFileInput from 'pz-client/src/widgets/customizable-file-input.component';
import classNames from 'classnames';
import handleClick from 'pz-client/src/support/handle-click';
import EditorState = Draft.Model.ImmutableData.EditorState;
import {RichUtils} from 'draft-js';
import {insertAttachment} from '../attachment-plugin/attachment-plugin';
import getYoutubeId from 'get-youtube-id';

export interface IContentMenuButtonProps {
    className?: string
    onClick?: (event) => any
}

export class ContentMenuButton extends React.Component<IContentMenuButtonProps, any> {
    static defaultProps = {
        onClick: () => {}
    };

    render() {
        const classes = classNames('content-menu-button', this.props.className);

        return (
            <button className={classes} onClick={handleClick(this._triggerClickAndClose.bind(this))}>
                {this.props.children}
            </button>
        );
    }

    static contextTypes: any = {
        closeContentMenu: React.PropTypes.func
    };

    context: any;

    _triggerClickAndClose(event) {
        this.props.onClick(event);

        if (this.context.closeContentMenu) {
            this.context.closeContentMenu();
        }
    }
}

export interface IAddPhotoButtonProps {
    onPhotoUploadRequested: (photo: File) => void
    maxFileSizeInMb?: number
    onAboveMaxFileSize?: (photoSizeInMb: number, photo: File) => void
}

const oneMegabyte = 1024*1024;

export class AddPhotoButton extends React.Component<IAddPhotoButtonProps, any> {
    static propTypes = {
        onPhotoUploadRequested: React.PropTypes.func,
        maxFileSizeInMb: React.PropTypes.number,
        onAboveMaxFileSize: React.PropTypes.func
    };

    static defaultProps = {
        onAboveMaxFileSize: () => {}
    };

    render() {
        return (
            <CustomizableFileInput
                className="add-photo-button-container"
                acceptImages={true}
                onChange={this._uploadPhoto.bind(this)}>

                <ContentMenuButton className="add-photo-button">
                    <i className="add-photo-button-icon" />

                    <span className="add-photo-button-label">
                        Add photo
                    </span>
                </ContentMenuButton>
            </CustomizableFileInput>
        );
    }

    static contextTypes: any = {
        closeContentMenu: React.PropTypes.func
    };

    context: any;

    private _uploadPhoto(files: Array<File>) {
        const [photo] = files;
        const photoSizeInMb = photo.size / oneMegabyte;

        if (photoSizeInMb > this.props.maxFileSizeInMb) {
            this.props.onAboveMaxFileSize(photoSizeInMb, photo);
            return;
        }

        this.props.onPhotoUploadRequested(photo);

        if (this.context.closeContentMenu) {
            this.context.closeContentMenu();
        }
    }
}

export interface ICustomizableAddPhotoButtonProps {
    onClick?: () => any
}

export class CustomizableAddPhotoButton extends React.Component<ICustomizableAddPhotoButtonProps, any> {
    static propTypes = {
        onClick: React.PropTypes.func
    };

    render() {
        return (
            <ContentMenuButton className="customizable-add-photo-button"
                               onClick={this._handleClick.bind(this)}>

                <i className="add-photo-button-icon" />

                <span className="add-photo-button-label">
                    Add photo
                </span>
            </ContentMenuButton>
        );
    }

    static contextTypes: any = {
        closeContentMenu: React.PropTypes.func
    };

    context: any;

    private _handleClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }

        if (this.context.closeContentMenu) {
            this.context.closeContentMenu();
        }
    }
}

class AddHeadingButton extends React.Component<any, any> {
    defaultProps = {
        onChange: (editorState) => {}
    };

    render() {
        return (
            <ContentMenuButton className="add-heading-button" onClick={this._addHeading.bind(this)}>
                {this.props.children}
            </ContentMenuButton>
        );
    }

    private _addHeading() {
        if (this.props.headingType === 'h1') {
            this._toggleBlockType('header-four');
        } else if (this.props.headingType === 'h2') {
            this._toggleBlockType('header-five');
        }
    }

    private _toggleBlockType(blockType) {
        const editorState = RichUtils.toggleBlockType(this.props.editorState, blockType);
        this.props.onChange(editorState);
    }
}

interface IAddHeadingProps {
    editorState: EditorState
    onChange?: (editorState: EditorState) => any
}

export class AddHeading1Button extends React.Component<IAddHeadingProps, any> {
    render() {
        return (
            <AddHeadingButton {...this.props} headingType="h1">
                H1
            </AddHeadingButton>
        );
    }
}

export class AddHeading2Button extends React.Component<IAddHeadingProps, any> {
    render() {
        return (
            <AddHeadingButton {...this.props} headingType="h2">
                H2
            </AddHeadingButton>
        );
    }
}

interface IEmbedVideoProps {
    editorState: EditorState
    onChange?: (editorState: EditorState) => any
}

export class EmbedVideoButton extends React.Component<IEmbedVideoProps, any> {
    render() {
        return (
            <ContentMenuButton className="embed-video-button"
                               onClick={this._showEmbedVideoPrompt.bind(this)}>

                <i className="embed-video-button-icon" />

                <span className="embed-video-button-label">
                    Embed video
                </span>
            </ContentMenuButton>
        );
    }

    _showEmbedVideoPrompt() {
        const videoUrl = window.prompt('Paste a YouTube video link');

        if (!videoUrl) {
            return;
        }

        const videoId = getYoutubeId(videoUrl);

        if (!videoId) {
            return;
        }

        this._embedVideo(videoId);
    }

    _embedVideo(videoId: string) {
        if (!this.props.onChange) {
            return;
        }

        const editorState = insertAttachment(this.props.editorState, {
            attachmentType: 'Youtube',
            videoId
        });

        this.props.onChange(editorState);
    }
}
