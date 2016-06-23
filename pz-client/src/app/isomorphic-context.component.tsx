import * as React from 'react';
import ReactElement = __React.ReactElement;

export interface IIsomorphicContextProps {
    relayRenderer: (rootContainer) => any
    children: any
}

/**
 * Sets up dependencies either passed in from the server on created on the client.
 */
export default React.createClass<IIsomorphicContextProps, any>({
    childContextTypes: {
        relayRenderer: React.PropTypes.func
    },
    
    getChildContext() {
        return {
            relayRenderer: this.props.relayRenderer
        };
    },
    
    render() {
        return this.props.children as ReactElement<any>;
    }
});
