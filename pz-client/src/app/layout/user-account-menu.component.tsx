import * as React from 'react';
import * as Relay from 'react-relay';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import appInfo from 'pz-client/src/app/app-info';

var classNames = require('classnames');

export interface IProps {
    currentUser: {
        displayName
    }
}

interface IContext {
    clearSessionData: () => void
}

class UserAccountMenu extends React.Component<IProps, any> {
    state = {
        isAccountMenuOpen: false
    };

    static contextTypes = {
        clearSessionData: React.PropTypes.func
    };

    context: IContext;

    render() {
        const classes = classNames('user-account-menu', {
            'menu-open': this.state.isAccountMenuOpen
        });

        return (
            <Dropdown className={classes}
                      isOpen={this.state.isAccountMenuOpen}
                      toggle={this._toggleAccountMenu.bind(this)}>

                <DropdownToggle className="current-user">
                    {this.props.currentUser.displayName}
                </DropdownToggle>

                <DropdownMenu className="account-menu-options">
                    <DropdownItem className="sign-out" onClick={this._signOut.bind(this)}>
                        Sign Out
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        );
    }

    private _toggleAccountMenu() {
        this.setState({isAccountMenuOpen: !this.state.isAccountMenuOpen});
    }

    private async _signOut(event) {
        event.preventDefault();

        const noop = () => {};
        const clearSessionData = this.context.clearSessionData || noop;

        await fetch(
            appInfo.addresses.getSignOutApi(),
            {method: 'POST', credentials: 'same-origin'}
        );

        clearSessionData();
    }
}

export default Relay.createContainer(UserAccountMenu, {
    fragments: {
        currentUser: () => Relay.QL`
            fragment on User {
                displayName
            }
        `
    }
});
