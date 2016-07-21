import * as React from 'react';
import * as Relay from 'react-relay';
import {Component} from 'react';
import SiteSearch from 'pz-client/src/search/site-search.component';
import Header from 'pz-client/src/app/layout/header.component';
import Footer from 'pz-client/src/app/layout/footer.component';

export interface IHomeControllerProps {
    params: any,

    viewer: {
        topics: Array<any>
    },

    currentUser: any
}

export class Home extends Component<IHomeControllerProps, any> {
    state = {
        clientLoaded: false
    };

    render() {
        return (
            <div className="home-namespace">
                <Header currentUser={this.props.currentUser} />

                <div className="primary-content">
                    <div className="primary-content-container">
                        <h1 className="branding-large">
                            Praisee
                        </h1>

                        <SiteSearch />
                    </div>
                </div>

                <div className="temporary-content">
                    <p>Topics loaded: {this.props.viewer.topics.length}</p>
                    <p>Client loaded: {this.state.clientLoaded ? 'true' : 'false'}</p>
                </div>

                <Footer />
            </div>
        );
    }

    componentDidMount() {
        this.setState({clientLoaded: true})
    }
}

export default Relay.createContainer(Home, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                topics {
                    id,
                    name
                }
            }
        `,

        currentUser: () => Relay.QL`
            fragment on User {
                ${Header.getFragment('currentUser')}
            }
        `
    }
});
