import * as React from 'react';
import * as Relay from 'react-relay';
import UserAccountMenu from 'pz-client/src/app/layout/user-account-menu.component';
import SiteSearch from 'pz-client/src/search/site-search.component';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import {withRouter} from 'react-router';
import SignInUpOverlay from 'pz-client/src/user/sign-in-up-overlay.component';

export interface IAppLayoutProps {
    children?: any

    router: {
        push: Function
    }

    currentUser: {
        displayName
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

                {this._renderSignInUp()}
            </div>
        );
    }

    state = {
        isSignInUpVisible: false
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentUser) {
            this._hideSignInUp();
        }
    }

    private _renderUserControls() {
        if (this.props.currentUser) {
            return (
                <UserAccountMenu currentUser={this.props.currentUser} />
            );

        } else {

            return (
                <a className="sign-in"
                   href={routePaths.user.signIn()}
                   onClick={this._showSignInUp.bind(this)}>

                    Sign in or Sign up
                </a>
            );
        }
    }

    private _showSignInUp(event) {
        event.preventDefault();
        this.setState({isSignInUpVisible: true})
    }

    private _hideSignInUp() {
        this.setState({isSignInUpVisible: false})
    }

    private _renderSignInUp() {
        return (
            <SignInUpOverlay
                isVisible={this.state.isSignInUpVisible}
                onHideRequested={this._hideSignInUp.bind(this)}
            />
        )
    }
}

export default Relay.createContainer(withRouter(Header), {
    fragments: {
        currentUser: () => Relay.QL`
            fragment on User {
                displayName,
                ${UserAccountMenu.getFragment('currentUser')}
            }
        `
    }
});
