import * as React from 'react';
import * as Relay from 'react-relay';
import {Component} from 'react';
import classNames from 'classnames';
import {Link} from 'react-router';
import ExpandButton from 'pz-client/src/widgets/expand-button-component';
import {withRouter} from 'react-router';
import ImageLoader from 'pz-client/src/widgets/image-loader';

export interface ITopicTileProps {
    topic: {
        name: string

        communityItems: {
            edges: [{
                node: {
                    summary: string

                    user: {
                        displayName: string
                    }
                }
            }]

            pageInfo: {
                hasNextPage: boolean
            }
        }

        routePath: string
    }

    backgroundPhotoUrls?: {
        variations: {
            initialLoad: string
            mediumFit: string
            mediumFitMobile: string
        }
    }

    router: {
        push: Function
    }

    className?: string
}

class TopicTile extends Component<ITopicTileProps, any> {
    render() {
        const classes = classNames('topic-tile', this.props.className);

        return (
            <div className={classes}>
                {this._renderBackground()}

                <div className="topic-tile-inner">
                    <Link to={this.props.topic.routePath} className="topic-header">
                        <span className="topic-name">{this.props.topic.name}</span>
                    </Link>

                    <ul className="community-items">
                        {this._renderCommunityItems()}
                    </ul>

                    <ExpandButton onExpand={this._redirectToTopic.bind(this)} />
                </div>
            </div>
        );
    }

    state = {
        backgroundHasLoaded: false
    };

    private _renderCommunityItems() {
        const items = this.props.topic.communityItems.edges;
        return items.map(({node}) => this._renderCommunityItem(node));
    }

    private _renderCommunityItem(communityItem) {
        return (
            <li key={communityItem.id} className="community-item">
                <Link className="community-item-link" to={communityItem.routePath}>
                    {communityItem.summary}
                </Link>
            </li>
        );
    }

    private _renderBackground() {
        const backgroundPhotoUrls = this.props.backgroundPhotoUrls && this.props.backgroundPhotoUrls.variations;

        let backgroundImage, initialLoadImage;

        if (backgroundPhotoUrls) {
            initialLoadImage = (
                <img className="initial-load-image" src={backgroundPhotoUrls.initialLoad} />
            );

            backgroundImage = (
                <ImageLoader
                    className="background-image"
                    src={backgroundPhotoUrls.mediumFit}
                    placeholder={initialLoadImage}
                    alt=""
                />
            );
        }

        const classes = classNames('background-container', {
            'background-has-loaded': this.state.backgroundHasLoaded
        });

        return (
            <div className={classes}>
                {backgroundImage}
            </div>
        );
    }

    private _redirectToTopic(){
        this.props.router.push(this.props.topic.routePath);
    }
}

export default Relay.createContainer(withRouter(TopicTile), {
    initialVariables:{
        limit: 5
    },

    fragments: {
        topic: ({limit}) => Relay.QL`
            fragment on Topic {
                name
                routePath
                
                communityItems(first: $limit) {
                    edges {
                        node {
                            id
                            summary
                            
                            user {
                                displayName
                            }
                            
                            routePath
                        }
                    }
                    
                    pageInfo {
                        hasNextPage
                    }
                }
            }
        `
    }
});
