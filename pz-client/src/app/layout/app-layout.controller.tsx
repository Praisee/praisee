import * as React from 'react';
import * as Relay from 'react-relay';
import SiteSearch from 'pz-client/src/search/site-search.component';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import Header from 'pz-client/src/app/layout/header.component';
import Footer from 'pz-client/src/app/layout/footer.component';

export interface IAppLayoutProps {
    children?: any,

    currentUser: any
}

export class AppLayout extends React.Component<IAppLayoutProps, any> {
    render() {
        return (
            <div className="app-layout">
                <Header currentUser={this.props.currentUser} />
                
                <div className="app-content">
                    <div className="app-layout-container">
                        {this.props.children}
                    </div>
                </div>
                
                <Footer />
            </div>
        );
    }
}

export default Relay.createContainer(AppLayout, {
    fragments: {
        currentUser: () => Relay.QL`
            fragment on User {
                ${Header.getFragment('currentUser')}
            }
        `
    }
});
