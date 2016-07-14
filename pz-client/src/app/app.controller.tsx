import * as React from 'react';
import ValidationMap = __React.ValidationMap;
import SiteSearch from 'pz-client/src/search/site-search.component';

export default class AppController extends React.Component<any, any> {
    //set context stuff here
    
    constructor(props?, context?) {
        super(props, context);
    }
    
    render() {
        return (
            <div className="app-namespace">
                <SiteSearch />
                
                {this.props.children}
            </div>
        );
    }
}
