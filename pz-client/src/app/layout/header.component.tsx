import * as React from 'react';
import * as Relay from 'react-relay';
import UserAccountMenu from 'pz-client/src/app/layout/user-account-menu.component';
import SiteSearch from 'pz-client/src/search/site-search.component';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import {withRouter} from 'react-router';
import SignInUpOverlay, {ISignInUpContext, SignInUpContextType} from 'pz-client/src/user/sign-in-up-overlay-component';
import ErrorList from 'pz-client/src/app/error-component';
import appInfo from 'pz-client/src/app/app-info';
import classNames from 'classnames';

const logoUrl = appInfo.addresses.getImage('praisee-logo.svg');

export interface IAppLayoutProps {
    children?: any;

    viewer: any;

    router: {
        push: Function
    }

    currentUser: {
        displayName
    }
}

export interface IAppLayoutState {
    isDropdownActive: boolean;
}

class Header extends React.Component<IAppLayoutProps, IAppLayoutState> {
    state = {
        isDropdownActive: false
    }

    static contextTypes: any = {
        signInUpContext: SignInUpContextType
    }

    context: {
        signInUpContext: ISignInUpContext
    }

    render() {
        const dropdownClasses = classNames(
            'drop-down-menu',
            { 'drop-down-menu-collapsed': !this.state.isDropdownActive }
        );

        return (
            <div className="app-header">
                <div className="app-header-container">
                    <div className="app-branding">
                        <Link to={routePaths.index()}>
                            <img src={logoUrl} alt="Praisee" className="logo" />
                        </Link>
                    </div>

                    <div className="app-search">
                        <SiteSearch />
                    </div>

                    <div className="app-controls">
                        {this._renderUserControls()}
                    </div>

                    <button className="nav-toggler"
                        onClick={this._toggleDropDownMenu.bind(this)}>
                        <i className="nav-toggler-icon" />
                    </button>
                </div>

                <div className={dropdownClasses} >
                    <div className="drop-down-menu-item">
                        {this._renderUserControls()}
                    </div>
                </div>

                <ErrorList viewer={this.props.viewer} />
            </div>
        );
    }

    private _toggleDropDownMenu() {
        this.setState({ isDropdownActive: !this.state.isDropdownActive });
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
                    onClick={this.context.signInUpContext.showSignInUp.bind(this)}>

                    Sign in or Sign up
                </a>
            );
        }
    }
}

export default Relay.createContainer(withRouter(Header), {
    fragments: {
        currentUser: () => Relay.QL`
            fragment on UserInterface {
                displayName,
                ${UserAccountMenu.getFragment('currentUser')}
            }
        `,
        viewer: () => Relay.QL`
            fragment on Viewer {
                ${ErrorList.getFragment('viewer')}
            }
        `
    }
});
