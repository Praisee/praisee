import * as React from 'react';
import * as Relay from 'react-relay';
import UserAccountMenu from 'pz-client/src/app/layout/user-account-menu.component';
import SiteSearch from 'pz-client/src/search/site-search.component';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import {withRouter} from 'react-router';
import ErrorList from 'pz-client/src/app/error-component';
import appInfo from 'pz-client/src/app/app-info';
import classNames from 'classnames';

const logoUrl = appInfo.addresses.getImage('praisee-logo.svg');

export interface IAppLayoutProps {
    children?: any;

    viewer: any;

    router: {
        push: Function
    }

    currentUser: {
        displayName
    }
}

class Header extends React.Component<IAppLayoutProps, any> {
    render() {
        return (
            <div className="app-header">
                <div className="app-header-container">
                    <div className="app-branding">
                        <Link to={routePaths.index()}>
                            <img src={logoUrl} alt="Praisee" className="logo" />
                        </Link>
                    </div>

                    <div className="app-search">
                        <SiteSearch />
                    </div>

                    <div className="app-controls">
                        <UserAccountMenu currentUser={this.props.currentUser} />
                    </div>
                </div>

                <ErrorList viewer={this.props.viewer} />
            </div>
        );
    }
}

export default Relay.createContainer(withRouter(Header), {
    fragments: {
        currentUser: () => Relay.QL`
            fragment on UserInterface {
                displayName,
                ${UserAccountMenu.getFragment('currentUser')}
            }
        `,
        viewer: () => Relay.QL`
            fragment on Viewer {
                ${ErrorList.getFragment('viewer')}
            }
        `
    }
});
