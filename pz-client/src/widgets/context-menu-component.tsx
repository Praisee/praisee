import * as React from 'react';
import {Component} from 'react';
import classNames from 'classnames';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export interface IProps {
    children?: any
    className?: string
}

export class ContextMenu extends Component<IProps, any> {
    render() {
        const classes = classNames('context-menu', this.props.className);

        return (
            <Dropdown className={classes}
                      isOpen={this.state.isMenuOpen}
                      toggle={this._toggleMenu.bind(this)}>

                <DropdownToggle className="context-menu-toggle">
                    <span />
                </DropdownToggle>

                <DropdownMenu className="context-menu-options">
                    {this.props.children}
                </DropdownMenu>
            </Dropdown>
        );
    }

    state = {
        isMenuOpen: false
    };

    private _toggleMenu() {
        this.setState({isMenuOpen: !this.state.isMenuOpen})
    }
}

export interface IContextMenuOptionProps {
    children?: any
    onClick?: () => any
    className?: string
}

export class ContextMenuOption extends Component<IContextMenuOptionProps, any> {
    render() {
        const classes = classNames('context-menu-option', this.props.className);

        return (
            <DropdownItem className={classes} onClick={this.props.onClick}>
                {this.props.children}
            </DropdownItem>
        );
    }
}
