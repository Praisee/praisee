import * as React from 'react';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import appInfo from 'pz-client/src/app/app-info';

const signInApi = appInfo.addresses.getSignInApi();
const signUpApi = appInfo.addresses.getSignUpApi();

interface IProps {
    showSignUp?: boolean
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
        isShowingSignUp: this.props.showSignUp !== false
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
        return (
            <div className="sign-up">
                <form action={signUpApi} method="post" onSubmit={this._submit.bind(this)}>
                    <fieldset>
                        <legend>Sign Up</legend>

                        <div className="form-group">
                            <input className="form-control" type="text" name="displayName" placeholder="Your name" key="displayName"/>
                        </div>

                        <div className="form-group">
                            <input className="form-control" type="text" name="email" placeholder="Your email" key="email" />
                        </div>

                        <div className="form-group">
                            <input className="form-control" type="password" name="password" placeholder="Password" key="password" />
                        </div>

                        <div>
                            <button type="submit" className="sign-up-button">Sign Up</button>
                        </div>
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
                            <input className="form-control" type="text" name="email" placeholder="Your email" key="email" />
                        </div>

                        <div className="form-group">
                            <input className="form-control" type="password" name="password" placeholder="Password" key="password" />
                        </div>

                        <div>
                            <button type="submit" className="sign-in-button">Sign In</button>
                        </div>
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

    private async _submit(event) {
        event.preventDefault();

        const noop = () => {};
        const clearSessionData = this.context.clearSessionData || noop;

        // TODO: We need a form library
        const formObject = Array.from((new FormData(event.target) as any).entries())
            .reduce((formObject, [key, value]) => {
                formObject[key] = value;
                return formObject;
            }, {});

        await fetch(event.target.action, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        clearSessionData();
    }

    private _switchToSignUp(event) {
        if (typeof this.props.showSignUp !== 'undefined') {
            return;
        }

        event.preventDefault();
        this.setState({isShowingSignUp: true});
        event.target.blur();
    }

    private _switchToSignIn(event) {
        if (typeof this.props.showSignUp !== 'undefined') {
            return;
        }

        event.preventDefault();
        this.setState({isShowingSignUp: false});
        event.target.blur();
    }
}
