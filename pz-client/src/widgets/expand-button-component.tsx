import * as React from 'react';
import {Component} from 'react';

export default class ExpandButton extends Component<IExpandProps, any>{
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <span type="button" className="expand-button" onClick={this._expand.bind(this) } >...</span>
        );
    }

    private _expand() {
        if(this.props.onExpand){
            this.props.onExpand();
        }
    }
}

interface IExpandProps{
    onExpand: () => {};
}