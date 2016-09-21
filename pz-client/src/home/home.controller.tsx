import * as React from 'react';
import * as Relay from 'react-relay';
import {Component} from 'react';
import SiteSearch from 'pz-client/src/search/site-search.component';
import Header from 'pz-client/src/app/layout/header.component';
import Footer from 'pz-client/src/app/layout/footer.component';
import appInfo from 'pz-client/src/app/app-info';
import SignInUpOverlay from 'pz-client/src/user/sign-in-up-overlay-component';

const logoUrl = appInfo.addresses.getImage('praisee-logo.svg');

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
                <SignInUpOverlay>
                    <Header currentUser={this.props.currentUser} viewer={this.props.viewer} />

                    <div className="primary-content">
                        <div className="primary-content-container">
                            <h1 className="branding-large">
                                <img src={logoUrl} alt="Praisee" />
                            </h1>

                            <SiteSearch />
                        </div>
                    </div>

                    <div className="temporary-content">
                        <p>Topics loaded: {this.props.viewer.topics.length}</p>
                        <p>Client loaded: {this.state.clientLoaded ? 'true' : 'false'}</p>
                    </div>

                    <Footer />
                </SignInUpOverlay>
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
                    id
                    name
                }
                ${Header.getFragment('viewer')}
            }
        `,

        currentUser: () => Relay.QL`
            fragment on UserInterface {
                ${Header.getFragment('currentUser')}
            }
        `
    }
});
