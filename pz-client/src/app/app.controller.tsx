import * as React from 'react';

export default class App extends React.Component<any, any> {
    //set context stuff here
    
    constructor(props?, context?) {
        super(props, context);
    }
    
    render() {
        return (
            <div className="app-namespace">
                {this.props.children}
            </div>
        );
    }
}
