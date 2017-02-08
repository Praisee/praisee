import * as React from 'react';
import SignInUp from 'pz-client/src/user/sign-in-up.component';
import CurrentUserType from 'pz-client/src/user/current-user-type';

import SimpleModal from 'pz-client/src/widgets/simple-modal-component';

interface IProps {
}

export interface ISignInUpContext {
    showSignInUp: (event?) => any;
    showMustSignInUp: (event?) => any;
    isLoggedIn: () => boolean
}

export var SignInUpContextType: React.Requireable<ISignInUpContext> = React.PropTypes.shape({
    showSignInUp: React.PropTypes.func,
    showMustSignInUp: React.PropTypes.func,
    isLoggedIn: React.PropTypes.func
});

export default class SignInUpOverlay extends React.Component<IProps, any> {
    state = {
        isSignInUpVisible: false,
        dueToUserMustSignInUp: null
    };

    static contextTypes: any = {
        getCurrentUser: React.PropTypes.func
    };

    static childContextTypes = {
        signInUpContext: SignInUpContextType
    };

    context: {
        getCurrentUser;
    };

    refs: any;

    getChildContext() {
        return {
            signInUpContext: {
                showSignInUp: this._showSignInUp.bind(this),
                showMustSignInUp: this._showMustSignInUp.bind(this),
                isLoggedIn: () => this.context.getCurrentUser().isLoggedIn
            }
        };
    }

    componentWillReceiveProps(_, __, nextContext) {
        if (nextContext && nextContext.getCurrentUser().isLoggedIn) {
            this._hideSignInUp();
        }
    }

    render() {
        return (
            <div className="sign-in-up-overlay">
                <SimpleModal className="app-sign-in-up-overlay-modal" ref="modal">
                    <SignInUp
                        dueToUserMustSignInUp={this.state.dueToUserMustSignInUp}
                        hideSignInUp={this._hideSignInUp.bind(this)}
                    />
                </SimpleModal>

                {this.props.children}
            </div>
        )
    }

    private _showSignInUp(event?) {
        if (event) {
            event.preventDefault();
        }

        this.setState({dueToUserMustSignInUp: null});

        if (this.refs.modal) {
            this.refs.modal.show();
        }
    }

    private _showMustSignInUp(event?) {
        if (event) {
            event.preventDefault();
        }

        this.setState({dueToUserMustSignInUp: true});

        if (this.refs.modal) {
            this.refs.modal.show();
        }
    }

    private _hideSignInUp() {
        if (this.refs.modal) {
            this.refs.modal.hide();
        }
    }
}
