import * as React from 'react';
import * as Relay from 'react-relay';
import CurrentUserType from 'pz-client/src/user/current-user-type';
import XhrSingleFileUploadRequester from 'pz-client/src/support/file-upload-requester';
import appInfo from 'pz-client/src/app/app-info';
import {ISingleFileUploadRequester} from '../../support/file-upload-requester';
import CustomizableFileInput from '../../widgets/customizable-file-input.component';

export interface IProps {
    topic: {
        serverId: number
    }
}

class AdminControls extends React.Component<IProps, any> {
    static contextTypes : any = {
        currentUser: CurrentUserType
    };

    context: any;

    render() {
        // TODO: This is a hack to prevent any user from uploading topic photos for now
        // TODO: We should be using user roles instead
        if (!this.context.currentUser || this.context.currentUser.id !== 1) {
            return <span />
        }

        return (
            <div className="admin-controls">
                <h5>Admin</h5>
                <h6>Upload Topic Thumbnail</h6>

                <CustomizableFileInput
                    className="add-topic-thumbnail-container"
                    acceptImages={true}
                    onChange={this._uploadPhoto.bind(this)}>

                    <span />
                </CustomizableFileInput>
            </div>
        );
    }

    private _fileUploadRequester: ISingleFileUploadRequester;

    constructor(props: IProps, state) {
        super(props, state);

        this._initializePhotoUploader(props.topic);
    }

    componentWillReceiveProps(nextProps) {
        this._initializePhotoUploader(nextProps.topic);
    }

    private _initializePhotoUploader(topic) {
        this._fileUploadRequester = new XhrSingleFileUploadRequester({
            url: appInfo.addresses.getTopicThumbnailPhotoUploadApi(topic.serverId),
            method: 'post',
            fieldName: 'photoFile'
        });
    }

    private _uploadPhoto([photo]) {
        const status = this._fileUploadRequester.send(photo);
        const photoPromise = status.toPromise();
        photoPromise.then(() => location.reload());
    }
}

export default Relay.createContainer(AdminControls, {
    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                serverId
            }
        `
    }
});
