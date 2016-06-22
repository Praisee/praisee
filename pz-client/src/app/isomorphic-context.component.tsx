import * as React from 'react';
import ReactElement = __React.ReactElement;

export interface IIsomorphicContextProps {
    children: any
}

/**
 * Sets up dependencies either passed in from the server on created on the client.
 */
export default React.createClass<IIsomorphicContextProps, any>({
    childContextTypes: {
    },
    
    getChildContext() {
        return {
        };
    },
    
    render() {
        return this.props.children as ReactElement<any>;
    }
});
