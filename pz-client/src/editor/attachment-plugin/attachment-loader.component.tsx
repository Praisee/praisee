import * as React from 'react';
import {IAttachment} from 'pz-client/src/editor/attachment-plugin/attachment';
import ContentAttachment from 'pz-client/src/editor/attachment-plugin/content-attachment.component';

export interface IProps {
    blockProps: {
        attachmentPromise: Promise<IAttachment>
    }
}

export default class AttachmentLoader extends React.Component<IProps, any> {
    state = {
        isLoading: true,
        hasFailed: false
    };

    constructor(props, state) {
        super(props, state);

        this._loadAttachmentPromise(props.blockProps.attachmentPromise);
    }

    render() {
        return (
            <div className="attachment-loader">
                {this._renderLoadingState()}
            </div>
        );
    }

    private _loadAttachmentPromise(attachmentPromise: Promise<IAttachment>) {
        (attachmentPromise
            .then((attachment: IAttachment) => {
                this.setState({
                    isLoading: false
                });
            })

            .catch((error) => {
                this.setState({
                    isLoading: false,
                    hasFailed: true
                });

                console.error('Failed to load attachment: ', error);
            })
        );
    }

    private _renderLoadingState() {
        if (this.state.isLoading) {
            return (
                <span>
                    Loading...
                </span>
            );

        } else if(this.state.hasFailed) {
            return (
                <span>
                    Failed to load :(
                </span>
            );
        }
    }
}
