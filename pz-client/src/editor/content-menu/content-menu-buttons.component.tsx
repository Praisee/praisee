import * as React from 'react';
import CustomizableFileInput from 'pz-client/src/widgets/customizable-file-input.component';

export interface IContentMenuButtonProps {
}

export class ContentMenuButton extends React.Component<IContentMenuButtonProps, any> {
    render() {
        return (
            <button>{this.props.children}</button>
        );
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
                acceptImages={true}
                onChange={this._uploadPhoto.bind(this)}>

                <ContentMenuButton>
                    Add Image
                </ContentMenuButton>
            </CustomizableFileInput>
        );
    }

    private _uploadPhoto(files: Array<File>) {
        const [photo] = files;
        const photoSizeInMb = photo.size / oneMegabyte;

        if (photoSizeInMb > this.props.maxFileSizeInMb) {
            this.props.onAboveMaxFileSize(photoSizeInMb, photo);
            return;
        }

        this.props.onPhotoUploadRequested(photo)
    }
}

