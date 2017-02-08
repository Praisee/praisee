import * as React from 'react';
import { Link } from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import appInfo from 'pz-client/src/app/app-info';
import GoogleTagManager from 'pz-client/src/support/google-tag-manager';

const signInApi = appInfo.addresses.getSignInApi();
const signUpApi = appInfo.addresses.getSignUpApi();

interface IProps {
    showSignUp?: boolean
    hideSignInUp?: () => void
    dueToUserMustSignInUp?: boolean
}

interface IContext {
    clearSessionData: () => void
}

export default class SignInUp extends React.Component<IProps, any> {
    static propTypes = {
        showSignUp: React.PropTypes.bool
    };

    static contextTypes = {
        clearSessionData: React.PropTypes.func
    };

    state = {
        isShowingSignUp: this.props.showSignUp !== false,
        errorText: ""
    };

    context: IContext;

    render() {
        const content = this.state.isShowingSignUp ?
            this._renderSignUp() : this._renderSignIn();

        return (
            <div className="sign-in-up">
                {content}
            </div>
        );
    }

    private _renderSignUp() {
        const signUpHeading = this.props.dueToUserMustSignInUp ?
            "Hey, you'll sign up to do that" : 'Sign Up';

        const signUpSubheading = this.props.dueToUserMustSignInUp ?
            "Don't worry, signing up is free and easy!"
            : 'Signing up is free and easy!';

        return (
            <div className="sign-up">
                <form action={signUpApi} method="post" onSubmit={this._submit.bind(this)}>
                    <fieldset>
                        <legend>
                            {signUpHeading}
                        </legend>

                        <div className="sign-in-up-subheading">
                            {signUpSubheading}
                        </div>

                        <div className="form-group">
                            <input className="form-control" type="text" name="displayName" placeholder="Your full name" key="displayName" />
                        </div>

                        <div className="form-group">
                            <input className="form-control" type="email" name="email" placeholder="Your email" key="email" />
                        </div>

                        <div className="form-group">
                            <input className="form-control" type="password" name="password" placeholder="Password" key="password" />
                        </div>

                        {this.state.errorText && <p className="error-text">{this.state.errorText}</p>}

                        <div className="sign-in-up-submit">
                            <button type="submit" className="sign-up-button">Sign Up</button>
                        </div>

                        {this._renderSocialLinks()}
                    </fieldset>
                </form>

                <p>
                    Already have an account?
                    <a href={routePaths.user.signIn()}
                        onClick={this._switchToSignIn.bind(this)}> Sign in here!</a>
                </p>
            </div>
        );
    }

    private _renderSignIn() {
        return (
            <div className="sign-up">
                <form action={signInApi} method="post" onSubmit={this._submit.bind(this)}>
                    <fieldset>
                        <legend>Sign In</legend>

                        <div className="form-group">
                            <input className="form-control" type="email" name="email" placeholder="Your email" key="email" />
                        </div>

                        <div className="form-group">
                            <input className="form-control" type="password" name="password" placeholder="Password" key="password" />
                        </div>

                        {this.state.errorText && <p className="error-text">{this.state.errorText}</p>}

                        <div className="sign-in-up-submit">
                            <button type="submit" className="sign-in-button">Sign In</button>
                        </div>

                        {this._renderSocialLinks()}
                    </fieldset>
                </form>

                <p>
                    Don't have an account?
                    <a href={routePaths.user.signUp()}
                        onClick={this._switchToSignUp.bind(this)}> Sign up here!</a>
                </p>
            </div>
        );
    }

    private _renderSocialLinks() {
        const noop = () => {};

        const maybeHideSignInUp = this.props.hideSignInUp ?
            this.props.hideSignInUp.bind(this) : noop;

        return (
            <div className="social-links">
                <span className="social-links-or">or use</span>

                <a href={appInfo.addresses.getFacebookAuthRoute()}
                   className="social-link"
                   target="_blank"
                   onClick={maybeHideSignInUp}>

                    <i className="social-icon facebook-icon" />
                </a>

                <a href={appInfo.addresses.getGoogleAuthRoute()}
                   className="social-link"
                   target="_blank"
                   onClick={maybeHideSignInUp}>

                    <i className="social-icon google-icon" />
                </a>
            </div>
        );
    }

    private async _submit(event) {
        event.preventDefault();

        // TODO: We need a form library
        const formObject = Array.from((new FormData(event.target) as any).entries())
            .reduce((formObject, [key, value]) => {
                formObject[key] = value;
                return formObject;
            }, {});

        fetch(event.target.action, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        })
            .then(this._handlePostResponse.bind(this))
            .then(this._handleJson.bind(this))
            .catch(this._handleError.bind(this));
    }

    private _handlePostResponse(response: IResponse) {
        if (response.status === 422) {
            throw new Error("That email is already in use.");
        }
        if (response.status === 500) {
            throw new Error("Oops! It looks like we're having trouble. Please try again later.");
        }
        if (response.ok) {
            return response.json();
        }
    }

    private _handleJson(json: any) {
        if (json.success) {
            if (this.state.isShowingSignUp) {
                GoogleTagManager.triggerSignUp();
            } else {
                GoogleTagManager.triggerSignIn();
            }

            if (this.props.hideSignInUp) {
                this.props.hideSignInUp();
            }

            this.context.clearSessionData();

        } else {
            throw new Error("Incorrect username or password");
        }
    }

    private _handleError(error: Error) {
        this.setState({
            errorText: error.message
        });
    }

    private _switchToSignUp(event) {
        if (typeof this.props.showSignUp !== 'undefined') {
            return;
        }

        event.preventDefault();
        this.setState({
            isShowingSignUp: true,
            errorText: ""
        });
        event.target.blur();
    }

    private _switchToSignIn(event) {
        if (typeof this.props.showSignUp !== 'undefined') {
            return;
        }

        event.preventDefault();
        this.setState({
            isShowingSignUp: false,
            errorText: ""
        });
        event.target.blur();
    }
}
