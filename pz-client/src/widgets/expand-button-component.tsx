import * as React from 'react';
import {Component} from 'react';
import handleClick from 'pz-client/src/support/handle-click';
import classNames from 'classnames';

interface IExpandProps{
    onExpand: () => any
    isExpanded?: boolean
    className?: string
}

export default class ExpandButton extends Component<IExpandProps, any>{
    render() {
        const buttonClasses = classNames(
            'expand-button',
            this.props.className
        );

        const containerClasses = classNames(
            'expand-button-container',
            this.props.isExpanded ? "expand-button-container-collapse" : "expand-button-container-expand"
        );

        return (
            <div className={containerClasses}>
                <button
                    className={buttonClasses}
                    onClick={handleClick(this.props.onExpand)}>

                    <i className="expand-button-icon" />
                </button>
            </div>
        );
    }
}
