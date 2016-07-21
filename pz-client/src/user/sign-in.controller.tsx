import * as React from 'react';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';

export default class SignIn extends React.Component<any, any> {
    render() {
        return (
            <div className="sign-in-up-namespace">
                <form action="/i/login" method="post">
                    <fieldset>
                        <legend>Sign in</legend>

                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input className="form-control" type="text" name="email" placeholder="Email"/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input className="form-control" type="password" name="password" placeholder="Password"/>
                        </div>
                        
                        <div>
                            <input type="submit" value="Login"/>
                        </div>
                    </fieldset>
                </form>
                
                <p>
                    Are you a total noob?
                    <Link to={routePaths.user.signUp()}> Sign up here!</Link>
                </p>
            </div>
        );
    }
}
