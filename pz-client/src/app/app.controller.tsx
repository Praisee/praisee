import * as React from 'react';
import ValidationMap = __React.ValidationMap;
import {IIsomorphicContextProps} from 'pz-client/src/app/isomorphic-context.component.tsx';

export interface IAppControllerProps {
}

export default class AppController extends React.Component<IAppControllerProps, any> {
    //set context stuff here
    
    context: IIsomorphicContextProps;
    
    static contextTypes: ValidationMap<any> = {
    };
    
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
