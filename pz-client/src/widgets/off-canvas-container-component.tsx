import * as React from 'react';
import { Component } from 'react';
import classNames from 'classnames';

export default class OffCanvasContainer extends Component<any, any> {
    state = { active: false };

    render() {
        var containerClasses = classNames("off-canvas-container", { "off-canvas-container-active": this.state.active });
        var toggleIcon = classNames("off-canvas-container-toggle-icon", 
            { "off-canvas-container-toggle-icon-collapse": this.state.active },
            { "off-canvas-container-toggle-icon-expand": !this.state.active });
        var showHideVerbiage = this.state.active ? "hide" : "show";
        
        return (
            <div className="off-canvas-wrapper" >
                <div className={containerClasses} >

                    <button
                        className="off-canvas-toggle-button"
                        onClick={this._toggleOffCanvasContainer.bind(this)}>
                        <i className={toggleIcon} />
                        {`${showHideVerbiage} more information`}
                    </button>

                    {this.props.children}
                </div>
            </div>
        )
    }

    private _toggleOffCanvasContainer() {
        this.setState({ active: !this.state.active });
    }
}

