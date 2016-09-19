import * as React from 'react';
import SignInUp from 'pz-client/src/user/sign-in-up.component';

interface IProps {
}

export class SignInController extends React.Component<IProps, any> {
    render() {
        return (
            <div className="sign-in-up-namespace">
                <SignInUp showSignUp={false} />
            </div>
        );
    }
}

export class SignUpController extends React.Component<IProps, any> {
    render() {
        return (
            <div className="sign-in-up-namespace">
                <SignInUp showSignUp={true} />
            </div>
        );
    }
}
