import * as React from 'react';
import { Component } from 'react';
import classNames from 'classnames';

export default class OffCanvasContainer extends Component<any, any> {
    state = { active: false };

    render() {
        var containerClasses = classNames("off-canvas-container", { "off-canvas-container-active": this.state.active });

        return (
            <div className="off-canvas-wrapper" >
                <button onClick={this._toggleOffCanvasContainer.bind(this)}>toggle side</button>
                
                <div className={containerClasses} >
                    {this.props.children}
                </div>
            </div>
        )
    }

    private _toggleOffCanvasContainer() {
        this.setState({ active: !this.state.active });
    }
}

