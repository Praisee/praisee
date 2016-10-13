import * as React from 'react';
import { Link } from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import appInfo from 'pz-client/src/app/app-info';

const signInApi = appInfo.addresses.getSignInApi();
const signUpApi = appInfo.addresses.getSignUpApi();

interface IProps {
    onSuccess: (json) => any
    showSignUp?: boolean
    submitText?: string
    onInteraction?: () => any
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
        isShowingPasswordField: false
    };

    context: IContext;

    render() {
        const content = this.state.isShowingSignUp ?
            this._renderSignUp() : this._renderSignIn();

        return (
            <div className="embedded-sign-in-up" onMouseDown={this._onInteraction.bind(this)}>
                {content}
            </div>
        );
    }

    private _renderSignUp() {
        const {submitText} = this.props;

        const onInteraction = this._onInteraction.bind(this);

        return (
            <div className="sign-up">
                <form action={signUpApi} method="post" onSubmit={this._submit.bind(this) }>
                    <div className="sign-in-up-name-group sign-in-up-field-group">
                        <input
                            className="sign-in-up-name sign-in-up-field"
                            type="text"
                            name="displayName"
                            placeholder="Your name"
                            key="displayName"
                            onFocus={onInteraction}
                            onChange={onInteraction}
                        />
                    </div>

                    <div className="sign-in-up-email-group sign-in-up-field-group">
                        <input
                            className="sign-in-up-email sign-in-up-field"
                            type="email"
                            name="email"
                            placeholder="Your email"
                            key="email"
                            onFocus={onInteraction}
                            onChange={this._emailFieldChanged.bind(this) }
                        />
                    </div>

                    {this.state.isShowingPasswordField &&
                        <div className="sign-in-up-password-group sign-in-up-field-group">
                            <input
                                className="sign-in-up-password sign-in-up-field"
                                type="password"
                                name="password"
                                placeholder="Password"
                                key="password"
                                onFocus={onInteraction}
                                onChange={onInteraction}
                            />
                        </div>
                    }

                    <div className="sign-in-up-button-container">
                        <button type="submit" className="sign-up-button">
                            <i className="optional-icon" />
                            {this.state.isShowingPasswordField ? `Sign up & ${submitText}` : submitText}
                        </button>
                    </div>
                </form>

                <div className="switch-sign-in-up-action">
                    Already have an account?
                    <a href={routePaths.user.signIn()}
                        onMouseDown={this._onInteraction.bind(this)}
                        onClick={this._switchToSignIn.bind(this)}> Sign in here!</a>
                </div>
            </div>
        );
    }

    private _renderSignIn() {
        const onInteraction = this._onInteraction.bind(this);

        return (
            <div className="sign-in">
                <form action={signInApi} method="post" onSubmit={this._submit.bind(this) }>
                    <div className="sign-in-up-email-group sign-in-up-field-group">
                        <input
                            className="sign-in-up-email sign-in-up-field"
                            type="email"
                            name="email"
                            placeholder="Your email"
                            key="email"
                            onFocus={onInteraction}
                            onChange={onInteraction}
                        />
                    </div>

                    <div className="sign-in-up-password-group sign-in-up-field-group">
                        <input
                            className="sign-in-up-password sign-in-up-field"
                            type="password"
                            name="password"
                            placeholder="Password"
                            key="password"
                            onFocus={onInteraction}
                            onChange={onInteraction}
                        />
                    </div>

                    <div className="sign-in-up-button-container">
                        <button type="submit" className="sign-in-button">
                            <i className="optional-icon" />
                            {this.props.submitText}
                        </button>
                    </div>
                </form>

                <div className="switch-sign-in-up-action">
                    Don't have an account?
                    <a href={routePaths.user.signUp()}
                        onMouseDown={this._onInteraction.bind(this)}
                        onClick={this._switchToSignUp.bind(this)}> Sign up here!</a>
                </div>
            </div>
        );
    }

    private _emailFieldChanged(event) {
        this.setState({ isShowingPasswordField: event.target.value.length > 0 });

        this._onInteraction();
    }

    private async _submit(event) {
        event.preventDefault();

        this._onInteraction();

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

        this._onInteraction();
    }

    private _switchToSignIn(event) {
        if (typeof this.props.showSignUp !== 'undefined') {
            return;
        }

        event.preventDefault();
        this.setState({ isShowingSignUp: false });
        event.target.blur();

        this._onInteraction();
    }

    private _onInteraction() {
        if (this.props.onInteraction) {
            this.props.onInteraction();
        }
    }
}