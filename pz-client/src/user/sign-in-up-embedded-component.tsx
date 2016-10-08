import * as React from 'react';
import { Link } from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import appInfo from 'pz-client/src/app/app-info';

const signInApi = appInfo.addresses.getSignInApi();
const signUpApi = appInfo.addresses.getSignUpApi();

interface IProps {
    showSignUp?: boolean
    submitText?: string
    onSuccess: (json) => {}
}

interface IState {
    isShowingSignUp?: boolean
    isShowingPasswordField?: boolean
}

interface IContext {
    clearSessionData: () => void
}

export default class SignInUp extends React.Component<IProps, IState> {
    static propTypes = {
        showSignUp: React.PropTypes.bool
    };

    static contextTypes = {
        clearSessionData: React.PropTypes.func
    };

    state = {
        isShowingSignUp: this.props.showSignUp !== false,
        isShowingPasswordField: false
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
        const {submitText} = this.props;

        return (
            <div className="sign-up">
                <form action={signUpApi} method="post" onSubmit={this._submit.bind(this) }>
                    <div className="form-group">
                        <input className="form-control" type="text" name="displayName" placeholder="Your name" key="displayName" />
                    </div>

                    <div className="form-group">
                        <input className="form-control" type="text"
                            name="email" placeholder="Your email" key="email"
                            onChange={this._emailFieldChanged.bind(this) } />
                    </div>

                    {this.state.isShowingPasswordField &&
                        <div className="form-group">
                            <input className="form-control" type="password" name="password" placeholder="Password" key="password" />
                        </div>
                    }

                    <div>
                        <button type="submit" className="sign-up-button">
                            {this.state.isShowingPasswordField ? `Sign Up & ${submitText}` : submitText}
                        </button>
                    </div>
                </form>

                <p>
                    Already have an account?
                    <a href={routePaths.user.signIn() }
                        onClick={this._switchToSignIn.bind(this) }> Sign in here!</a>
                </p>
            </div>
        );
    }

    private _renderSignIn() {
        return (
            <div className="sign-in">
                <form action={signInApi} method="post" onSubmit={this._submit.bind(this) }>
                    <div className="form-group">
                        <input className="form-control" type="text" name="email" placeholder="Your email" key="email" />
                    </div>

                    <div className="form-group">
                        <input className="form-control" type="password" name="password" placeholder="Password" key="password" />
                    </div>

                    <div>
                        <button type="submit" className="sign-in-button">{this.props.submitText}</button>
                    </div>
                </form>

                <p>
                    Don't have an account?
                    <a href={routePaths.user.signUp() }
                        onClick={this._switchToSignUp.bind(this) }> Sign up here!</a>
                </p>
            </div>
        );
    }

    private _emailFieldChanged(event) {
        this.setState({ isShowingPasswordField: event.target.value.length > 0 });
    }

    private async _submit(event) {
        event.preventDefault();

        const noop = () => { };
        const clearSessionData = this.context.clearSessionData || noop;

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
            .then((response) => {
                if (response.ok) {
                    if (this.props.onSuccess) {
                        this.props.onSuccess(response.json);
                    }
                    clearSessionData();
                }
            });
    }

    private _switchToSignUp(event) {
        if (typeof this.props.showSignUp !== 'undefined') {
            return;
        }

        event.preventDefault();
        this.setState({ isShowingSignUp: true });
        event.target.blur();
    }

    private _switchToSignIn(event) {
        if (typeof this.props.showSignUp !== 'undefined') {
            return;
        }

        event.preventDefault();
        this.setState({ isShowingSignUp: false });
        event.target.blur();
    }
}
