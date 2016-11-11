import * as React from 'react';
import {Component} from 'react';

export default class OffCanvasContainer extends Component<any, any> {
    render() {
        return (
            <div className="off-canvas-wrapper" >
                <div className="off-canvas-container" >
                    {this.props.children}
                </div>
            </div>
        )
    }
}

