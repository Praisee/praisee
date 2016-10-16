import * as React from 'react';
import {Component} from 'react';
import handleClick from 'pz-client/src/support/handle-click';
import classNames from 'classnames';

interface IExpandProps{
    onExpand: () => {}
    className?: string
    isExpanded: boolean
}

export default class ExpandButton extends Component<IExpandProps, any>{
    render() {
        const classes = classNames(
            'expand-button',
            this.props.className,
            this.props.isExpanded ? "collapse" : "expand"
        );

        return (
            <div className="expand-container">
                <button
                    className={classes}
                    onClick={handleClick(this.props.onExpand)}>

                    <i className="icon" />
                </button>
            </div>
        );
    }
}
