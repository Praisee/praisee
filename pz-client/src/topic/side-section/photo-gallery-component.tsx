import * as React from 'react';
import * as Relay from 'react-relay';
import {withRouter} from 'react-router';
import Masonry from 'react-masonry-component';
import ExpandButton from 'pz-client/src/widgets/expand-button-component';
import classNames from 'classnames';

export interface IProps {
    topic: {
        photoGallery: {
            edges: Array<{
                node: {
                    defaultUrl: string

                    variations: {
                        thumbnail: string
                    }
                }
            }>

            pageInfo: {
                hasNextPage: boolean
            }
        }
    }

    relay: any

    router: {
        push(location)
    }
}

class PhotoGallery extends React.Component<IProps, any> {
    render() {
        if (this.props.topic.photoGallery.edges.length < 3) {
            return <span />
        }

        const classes = classNames('photo-gallery', {
            'photo-gallery-loading': this.state.isLoading,
            'photo-gallery-revealed': !this.state.isLoading
        });

        return (
            <div className={classes}>
                <Masonry onImagesLoaded={this._revealPhotoGallery.bind(this)}
                         options={{transitionDuration: '0'}}>
                    {this._renderPhotos()}
                </Masonry>

                {this._renderMoreTrigger()}
            </div>
        );
    }

    state = {
        isLoading: true
    };

    private _renderPhotos() {
        return this.props.topic.photoGallery.edges.map(({node: photo}) => {
            return this._renderPhoto(photo);
        });
    }

    private _renderPhoto(photo) {
        return (
            <img className="photo-gallery-photo"
                 key={photo.defaultUrl}
                 src={photo.variations.thumbnail}
                 onClick={this._openPhotoParentEventHandler(photo)}
            />
        )
    }

    private _renderMoreTrigger() {
        if (!this.props.topic.photoGallery.pageInfo.hasNextPage) {
            return;
        }

        return (
            <ExpandButton onExpand={this._showMorePhotos.bind(this)} />
        );
    }

    private _revealPhotoGallery() {
        if (!this.state.isLoading) {
            return;
        }

        this.setState({isLoading: false});
    }

    private _showMorePhotos() {
        this.props.relay.setVariables({limit: this.props.relay.variables.limit + 10})
    }

    private _openPhotoParentEventHandler(photo) {
        return () => {
            this.props.router.push({
                pathname: photo.parent.routePath
            });
        };
    }
}

export default Relay.createContainer(withRouter(PhotoGallery), {
    initialVariables: {
        limit: 10
    },

    fragments: {
        topic: () => Relay.QL`
            fragment on Topic {
                photoGallery(first: $limit) {
                    edges {
                        node {
                            parent {
                                ... on CommunityItem {
                                    routePath
                                }
                            }
                            
                            defaultUrl
                            variations {
                                thumbnail
                            }
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
