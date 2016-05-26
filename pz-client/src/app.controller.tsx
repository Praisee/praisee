import * as React from 'react';

export default class AppController extends React.Component<{},{}>
{
    //set context stuff here
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

