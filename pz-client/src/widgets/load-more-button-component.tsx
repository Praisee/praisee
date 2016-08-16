import {Component} from 'react';
import * as React from 'react';

export default class LoadMore extends Component<ILoadMoreProps, any>{
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const button = this.props.isLoading
            ? <button type="button">please wait...</button>
            : <button type="button" onClick={this.props.onLoadMore}>
                Load more
            </button>
        return ( button );
    }
}

export interface ILoadMoreProps {
    isLoading: boolean,
    onLoadMore: Function
}