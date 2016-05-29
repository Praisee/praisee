import * as React from 'react';

export default class AppController extends React.Component<{},{}>
{
    //set context stuff here
    render() {
        return (
            <div className="app-namespace">
                {this.props.children}
            </div>
        );
    }
}

