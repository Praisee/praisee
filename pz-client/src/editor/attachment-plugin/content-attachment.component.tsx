import * as React from 'react';
import {
    IAttachment,
    isPhotoAttachment,
    IPhotoAttachment,
    isYoutubeAttachment,
    IYoutubeAttachment
} from 'pz-client/src/editor/attachment-plugin/attachment';

export interface IProps {
    blockProps: {
        attachment: IAttachment
    }
}

export default class ContentAttachment extends React.Component<IProps, any> {
    state = {
        caption: null
    };

    render() {
        const attachment = this.props.blockProps.attachment;

        return (
            <div className="content-attachment">
                {this._renderAttachmentType(attachment)}
            </div>
        );
    }

    private _renderAttachmentType(attachment) {
        if (isPhotoAttachment(attachment)) {
            return (
                <PhotoAttachment attachment={attachment}/>
            );

        } else if (isYoutubeAttachment(attachment)) {
            return (
                <YoutubeAttachment attachment={attachment} />
            );

        } else {

            throw new Error('Unknown attachment type: ' + attachment);
        }
    }

    private _updateCaption(event) {
        this.setState({caption: event.target.value});
    }
}

interface IPhotoAttachmentProps {
    attachment: IPhotoAttachment
}

class PhotoAttachment extends React.Component<IPhotoAttachmentProps, any> {
    render() {
        return (
            <img src={this.props.attachment.defaultUrl}
                 style={{maxWidth: '100%'}}
            />
        );
    }
}

interface IYoutubeAttachmentProps {
    attachment: IYoutubeAttachment
}

class YoutubeAttachment extends React.Component<IYoutubeAttachmentProps, any> {
    render() {
        const safeVideoId = encodeURIComponent(this.props.attachment.videoId);
        const url = `http://youtube.com/embed/${safeVideoId}`;

        // TODO: This shouldn't be hardcoded, it needs to be moved to a stylesheet
        // From: https://css-tricks.com/NetMag/FluidWidthVideo/Article-FluidWidthVideo.php
        const containerStyle = {
            position: 'relative',
            paddingBottom: '56.25%', /* 16:9 */
            paddingTop: '25px',
            height: 0
        };

        const videoStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
        };

        return (
            <div style={containerStyle}>
                <iframe
                    style={videoStyle}
                    type="text/html"
                    src={url}
                    frameBorder="0"
                />
            </div>
        );
    }
}
