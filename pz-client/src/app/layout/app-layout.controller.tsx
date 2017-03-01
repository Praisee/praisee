import * as React from 'react';
import * as Relay from 'react-relay';
import SiteSearch from 'pz-client/src/search/site-search.component';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import Header from 'pz-client/src/app/layout/header.component';
import Footer from 'pz-client/src/app/layout/footer.component';
import SignInUpOverlay from 'pz-client/src/user/sign-in-up-overlay-component';

export interface IAppLayoutProps {
    children?: any,

    currentUser: any,

    viewer: any
}

export class AppLayout extends React.Component<IAppLayoutProps, any> {
    render() {
        return (
            <div className="app-layout-namespace">
                <SignInUpOverlay>
                    <Header currentUser={this.props.currentUser || null} viewer={this.props.viewer} />

                    <div className="app-content">
                        {this.props.children}
                    </div>

                    <Footer />
                </SignInUpOverlay>
            </div>
        );
    }
}

export default Relay.createContainer(AppLayout, {
    fragments: {
        currentUser: () => Relay.QL`
            fragment on UserInterface {
                ${Header.getFragment('currentUser')}
            }
        `,
        viewer: () => Relay.QL`
            fragment on Viewer {
                ${Header.getFragment('viewer')}
            }
        `
    }
});
