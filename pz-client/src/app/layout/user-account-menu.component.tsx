import * as React from 'react';
import * as Relay from 'react-relay';
import {Link} from 'react-router';
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import {ISignInUpContext, SignInUpContextType} from 'pz-client/src/user/sign-in-up-overlay-component';
import appInfo from 'pz-client/src/app/app-info';
import routePaths from 'pz-client/src/router/route-paths';
var Avatar = require('react-avatar');

import classNames from 'classnames';

export interface IProps {
    currentUser: {
        displayName: string
        isLoggedIn: boolean
        routePath: string
        avatarInfo: {
            facebookId: string
            googleId: string
            emailHash: string
        }
    }
}

interface IContext {
    clearSessionData: () => void
    signInUpContext: ISignInUpContext
}

class UserAccountMenu extends React.Component<IProps, any> {
    state = {
        isAccountMenuOpen: false
    };

    static contextTypes = {
        clearSessionData: React.PropTypes.func,
        signInUpContext: SignInUpContextType
    };

    context: IContext;

    render() {
        if (!this.props.currentUser.isLoggedIn) {
            return this._renderSignInMenu();
        }

        const {facebookId, googleId, emailHash} = this.props.currentUser.avatarInfo;
        const {displayName, routePath} = this.props.currentUser;

        const classes = classNames('user-account-menu', {
            'menu-open': this.state.isAccountMenuOpen
        });

        return (
            <Dropdown className={classes}
                isOpen={this.state.isAccountMenuOpen}
                toggle={this._toggleAccountMenu.bind(this)}>

                <DropdownToggle className="current-user">
                    <i className="user-account-menu-icon" />
                    <span className="display-name">
                        {this.props.currentUser.displayName}
                    </span>
                    <Avatar
                        className="avatar-image"
                        size={25}
                        facebookId={facebookId}
                        googleId={googleId}
                        md5email={emailHash}
                        name={displayName}
                        round={true}
                        />
                </DropdownToggle>

                <DropdownMenu className="account-menu-options">
                    <DropdownItem className="sign-out">
                        <Link to={routePath}>
                            My Profile
                        </Link>
                    </DropdownItem>
                    <DropdownItem className="sign-out" onClick={this._signOut.bind(this)}>
                        Sign Out
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        );
    }

    private _renderSignInMenu() {
        const dropdownClasses = classNames('user-account-menu', 'sign-in-dropdown-menu', {
            'menu-open': this.state.isAccountMenuOpen
        });

        return (
            <div className="sign-in-container">
                <a className="sign-in"
                    href={routePaths.user.signIn()}
                    onClick={this.context.signInUpContext.showSignInUp.bind(this)}>

                    Sign in or Sign up
                </a>

                <Dropdown className={dropdownClasses}
                    isOpen={this.state.isAccountMenuOpen}
                    toggle={this._toggleAccountMenu.bind(this)}>

                    <DropdownToggle className="current-user">
                        <i className="user-account-menu-icon" />
                    </DropdownToggle>

                    <DropdownMenu className="account-menu-options">
                        <DropdownItem className="sign-in-dropdown-item"
                            onClick={this.context.signInUpContext.showSignInUp.bind(this)}>
                            Sign in or Sign up
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        );
    }

    private _toggleAccountMenu() {
        this.setState({isAccountMenuOpen: !this.state.isAccountMenuOpen});
    }

    private async _signOut(event) {
        event.preventDefault();

        await fetch(
            appInfo.addresses.getSignOutApi(),
            {method: 'POST', credentials: 'same-origin'}
        );

        this.context.clearSessionData();
    }
}

export default Relay.createContainer(UserAccountMenu, {
    fragments: {
        currentUser: () => Relay.QL`
            fragment on CurrentUser {
                displayName
                isLoggedIn
                routePath
                avatarInfo {
                    facebookId
                    googleId
                    emailHash
                }
            }
        `
    }
});
