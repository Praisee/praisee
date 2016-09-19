import * as React from 'react';
import SignInUp from 'pz-client/src/user/sign-in-up.component';

// TODO: Eventually we should make our own overlay component
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

interface IProps {
    isVisible: boolean,
    onHideRequested: () => any
}

export default class SignInUpOverlay extends React.Component<IProps, any> {
    render() {
        return (
            <Modal className="sign-in-up-overlay"
                   isOpen={this.props.isVisible}
                   toggle={this.props.onHideRequested}>

                <ModalBody>
                    <button
                        className="sign-in-up-overlay-hide-button"
                        onClick={this.props.onHideRequested}
                    />

                    <SignInUp />
                </ModalBody>
            </Modal>
        );
    }
}
