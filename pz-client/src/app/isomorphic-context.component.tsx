import * as React from 'react';
import ReactElement = __React.ReactElement;

export interface IIsomorphicContextProps {
    children: any,
    notFoundHandler?: (errorComponent) => any
}

/**
 * Sets up dependencies either passed in from the server on created on the client.
 */
export default React.createClass<IIsomorphicContextProps, any>({
    childContextTypes: {
        notFoundHandler: React.PropTypes.func
    },

    getChildContext() {
        return {
            notFoundHandler: this.props.notFoundHandler
        };
    },

    render() {
        return this.props.children as ReactElement<any>;
    }
});
