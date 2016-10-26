import * as React from 'react';
import * as Relay from 'react-relay';
import {Component} from 'react';
import SiteSearch from 'pz-client/src/search/site-search.component';
import Header from 'pz-client/src/app/layout/header.component';
import Footer from 'pz-client/src/app/layout/footer.component';
import appInfo from 'pz-client/src/app/app-info';
import SignInUpOverlay from 'pz-client/src/user/sign-in-up-overlay-component';
import TopicTile from 'pz-client/src/home/topic-tile-component';
import Masonry from 'react-masonry-component';

const logoUrl = appInfo.addresses.getImage('praisee-logo.svg');

export interface IHomeControllerProps {
    params: any,

    viewer: {
        topics: Array<any>

        staticPhotos: [{
            name: string
            variations
        }]
    }

    currentUser: any

    electronicsTopic
    cosmeticsTopic
    homeGardenTopic
    photographyTopic
    artsCraftsTopic
    outdoorsTopic
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
                                <img className="praisee-logo" src={logoUrl} alt="Praisee" />
                            </h1>

                            <SiteSearch />
                        </div>
                    </div>

                    <div className="topic-tiles">
                        {this._renderTopicTile(this.props.electronicsTopic, 'electronics-topic', 'electronics')}
                        {this._renderTopicTile(this.props.cosmeticsTopic, 'cosmetics-topic', 'cosmetics')}
                        {this._renderTopicTile(this.props.homeGardenTopic, 'home-garden-topic', 'homeGarden')}
                        {this._renderTopicTile(this.props.photographyTopic, 'photography-topic', 'photography')}
                        {this._renderTopicTile(this.props.artsCraftsTopic, 'arts-crafts-topic', 'artsCrafts')}
                        {this._renderTopicTile(this.props.outdoorsTopic, 'outdoors-topic', 'outdoors')}
                    </div>

                    <Footer />
                </SignInUpOverlay>
            </div>
        );
    }

    private _renderTopicTile(topic, className, backgroundPhotoName) {
        const backgroundPhotoUrls = this.props.viewer.staticPhotos.find(
            ({name}) => name === backgroundPhotoName
        );

        return (
            <TopicTile
                topic={topic}
                className={className}
                backgroundPhotoUrls={backgroundPhotoUrls}
            />
        );
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
                
                staticPhotos {
                    name
                    
                    variations {
                        initialLoad
                        mediumFit
                        mediumFitMobile
                    }
                }
                
                ${Header.getFragment('viewer')}
            }
        `,

        currentUser: () => Relay.QL`
            fragment on UserInterface {
                ${Header.getFragment('currentUser')}
            }
        `,

        electronicsTopic: () => Relay.QL`fragment on Topic { ${TopicTile.getFragment('topic')} }`,
        cosmeticsTopic: () => Relay.QL`fragment on Topic { ${TopicTile.getFragment('topic')} }`,
        homeGardenTopic: () => Relay.QL`fragment on Topic { ${TopicTile.getFragment('topic')} }`,
        photographyTopic: () => Relay.QL`fragment on Topic { ${TopicTile.getFragment('topic')} }`,
        artsCraftsTopic: () => Relay.QL`fragment on Topic { ${TopicTile.getFragment('topic')} }`,
        outdoorsTopic: () => Relay.QL`fragment on Topic { ${TopicTile.getFragment('topic')} }`,
    }
});
