import * as React from 'react';
import SignInUp from 'pz-client/src/user/sign-in-up.component';
import CurrentUserType from 'pz-client/src/user/current-user-type';

// TODO: Eventually we should make our own overlay component
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

interface IProps {
}

export interface ISignInUpContext {
    showSignInUp: Function;
    isLoggedIn: boolean
}

export var SignInUpContextType: React.Requireable<ISignInUpContext> = React.PropTypes.shape({
    showSignInUp: React.PropTypes.func,
    isLoggedIn: React.PropTypes.bool
});

export default class SignInUpOverlay extends React.Component<IProps, any> {
    state = {
        isSignInUpVisible: false
    };

    static contextTypes: any = {
        currentUser: CurrentUserType
    };

    static childContextTypes = {
        signInUpContext: SignInUpContextType
    };

    context: {
        currentUser;
    };

    getChildContext() {
        return {
            signInUpContext: {
                showSignInUp: this._showSignInUp.bind(this),
                isLoggedIn: this.context.currentUser !== null
            }
        };
    }

    componentWillReceiveProps(_, __, nextContext) {
        if (nextContext && nextContext.currentUser) {
            this._hideSignInUp();
        }
    }

    render() {
        return (
            <div className="sign-in-up-overlay">
                {this._renderModalBody()}
                {this.props.children}
            </div>
        )
    }

    private _showSignInUp(event) {
        event.preventDefault();
        this.setState({ isSignInUpVisible: true })
    }

    private _hideSignInUp() {
        this.setState({ isSignInUpVisible: false })
    }

    private _renderModalBody() {
        if (this.state.isSignInUpVisible) {
            return (
                <Modal className="sign-in-up-overlay-modal"
                    isOpen={this.state.isSignInUpVisible}
                    toggle={this._hideSignInUp.bind(this)}>

                    <ModalBody>
                        <button
                            className="sign-in-up-overlay-hide-button"
                            onClick={this._hideSignInUp.bind(this)}
                            />

                        <SignInUp />
                    </ModalBody>
                </Modal>
            )
        }
    }
}
