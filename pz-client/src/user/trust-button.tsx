import * as React from 'react';
import * as Relay from 'react-relay';
import { Component } from 'react';
import { ISignInUpContext, SignInUpContextType } from 'pz-client/src/user/sign-in-up-overlay-component';
import handleClick from 'pz-client/src/support/handle-click';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';
import ToggleTrustMutation from 'pz-client/src/user/toggle-trust-mutation';

class TrustButton extends Component<TrustButtonProps, any>{
    static contextTypes = {
        signInUpContext: SignInUpContextType
    };

    context: {
        signInUpContext: ISignInUpContext
    };

    render() {
        const {isCurrentUserTrusting, isCurrentUser} = this.props.user;

        if (isCurrentUser) {
            return;
        }

        return (
            <button className="trust-button" title="Trust this user"
                onClick={handleClick(this._toggleTrust)}
                >

                <i className="trust-button-icon"></i>

                {isCurrentUserTrusting ? "Trusted" : "Trust"}
            </button>
        );
    }

    private _toggleTrust = () => {
        if (!this.context.signInUpContext.isLoggedIn()) {
            GoogleTagManager.triggerAttemptedTrust();

            this.context.signInUpContext.showSignInUp();
            return;
        }

        GoogleTagManager.triggerTrust();

        this.props.relay.commitUpdate(new ToggleTrustMutation({
            user: this.props.user
        }));
    }
}

export default Relay.createContainer(TrustButton, {
    fragments: {
        user: () => Relay.QL`
            fragment on UserInterface {
                isCurrentUser
                ${ToggleTrustMutation.getFragment('user')}
                
                ... on OtherUser {
                    isCurrentUserTrusting
                }
            }
        `
    }
});

interface TrustButtonProps {
    user: {
        isCurrentUser: boolean;
        isCurrentUserTrusting?: boolean
    };
    relay: any;
}