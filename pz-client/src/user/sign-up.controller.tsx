import * as React from 'react';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import appInfo from 'pz-client/src/app/app-info';

const signUpApi = appInfo.addresses.getSignUpApi();

export default class SignUp extends React.Component<any, any> {
    render() {
        return (
            <div className="sign-in-up-namespace">
                <form action={signUpApi} method="post">
                    <fieldset>
                        <legend>Sign up</legend>

                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input className="form-control" type="text" name="email" placeholder="Email"/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input className="form-control" type="password" name="password" placeholder="Password"/>
                        </div>

                        <div>
                            <input type="submit" value="Sign up"/>
                        </div>
                    </fieldset>
                </form>

                <p>
                    Already have an account?
                    <Link to={routePaths.user.signIn()}> Sign in here!</Link>
                </p>
            </div>
        );
    }
}
