import * as React from 'react';
import {
    IAttachment,
    isPhotoAttachment, IPhotoAttachment
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
            return this._renderPhotoAttachment(attachment);

        } else {

            throw new Error('Unknown attachment type: ' + attachment);
        }
    }

    private _renderPhotoAttachment(attachment: IPhotoAttachment) {
        return (
            <img src={attachment.defaultUrl}
                 alt={this.state.caption}
                 style={{maxWidth: '100%'}}
            />
        );
    }

    private _updateCaption(event) {
        this.setState({caption: event.target.value});
    }
}
