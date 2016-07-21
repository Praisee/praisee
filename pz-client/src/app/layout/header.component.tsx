import * as React from 'react';
import * as Relay from 'react-relay';
import SiteSearch from 'pz-client/src/search/site-search.component';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import {withRouter} from 'react-router';

export interface IAppLayoutProps {
    children?: any

    router: {
        push: Function
    }

    currentUser: {
        email
    }
}

class Header extends React.Component<IAppLayoutProps, any> {
    render() {
        return (
            <div className="app-header">
                <div className="app-layout-container">
                    <div className="app-branding">
                        <Link to={routePaths.index()}>
                            Praisee
                        </Link>
                    </div>

                    <div className="app-search">
                        <SiteSearch />
                    </div>

                    <div className="app-controls">
                        {this._renderUserControls()}
                    </div>
                </div>
            </div>
        );
    }

    private _renderUserControls() {
        if (this.props.currentUser) {
            return (
                <span className="current-user">
                    Signed in as {this.props.currentUser.email}
                </span>
            )

        } else {

            return (
                <button className="sign-in" onClick={this._showSignIn.bind(this)}>
                    Sign in or sign up
                </button>
            );
        }
    }

    private _showSignIn() {
        this.props.router.push(routePaths.user.signIn());
    }
}

export default Relay.createContainer(withRouter(Header), {
    fragments: {
        currentUser: () => Relay.QL`
            fragment on User {
                email
            }
        `
    }
});
