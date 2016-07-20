import * as React from 'react';
import SiteSearch from 'pz-client/src/search/site-search.component';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';

export interface IAppLayoutProps {
    children?: any
}

export default class AppLayout extends React.Component<IAppLayoutProps, any> {
    render() {
        return (
            <div className="app-header">
                <div className="app-layout-container">
                    <div className="app-branding">
                        <Link to={routePaths.index()}>
                            Praisee
                        </Link>
                    </div>

                    <div className="app-search">
                        <SiteSearch />
                    </div>

                    <div className="app-controls">
                        <button className="log-in">
                            Log-in
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
