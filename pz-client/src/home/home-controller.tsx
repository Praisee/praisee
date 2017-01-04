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
import {Link} from 'react-router';
import RatingStars from 'pz-client/src/widgets/rating-stars-component';
import {withRouter} from 'react-router';
import handleClick from 'pz-client/src/support/handle-click';
import routePaths from 'pz-client/src/router/route-paths';

const logoUrl = appInfo.addresses.getImage('praisee-logo.svg');

export interface IHomeControllerProps {
    params: any

    viewer: {
        topTenCategoriesByReviews: [{
            id: any
            name: string
            routePath: any

            topTenReviewedSubTopics: [{
                id: any
                name: string
                routePath: any
                ratingForViewer: number

                photoGallery: {
                    edges: [{
                        node: {
                            variations: {
                                square: string
                                mobileSquare: string
                            }
                        }
                    }]
                }
            }]
        }]
    }

    currentUser: any

    router: {
        push(location)
    }
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

                    <div className="branding-container">
                        <h1 className="branding-large">
                            <img className="praisee-logo" src={logoUrl} alt="Praisee" />
                        </h1>

                        <h2 className="praisee-description">
                            The one stop review spot.
                        </h2>
                    </div>

                    <div className="primary-content">
                        <div className="primary-content-container">
                            <div className="add-review-section">
                                {this._renderAddReviewButton()}
                            </div>

                            <div className="or-divider">
                                or
                            </div>

                            <div className="search-section">
                                <SiteSearch />
                            </div>
                        </div>
                    </div>

                    <div className="secondary-section">
                        <div className="categories-section">
                            {this._renderCategories()}
                        </div>
                    </div>

                    <Footer />
                </SignInUpOverlay>
            </div>
        );
    }

    private _renderAddReviewButton() {
        const goToAddReviewPage = () => {
            this.props.router.push({
                pathname: routePaths.addReview()
            });
        };

        return (
            <button className="add-review-button" onClick={handleClick(goToAddReviewPage)}>
                <i className="add-review-icon" />

                <span className="add-review-label">
                    Add your review
                </span>
            </button>
        );
    }

    private _renderCategories() {
        const firstFiveCategories = this.props.viewer.topTenCategoriesByReviews.slice(0, 5);

        return firstFiveCategories.map(category => {
            return this._renderCategory(category);
        });
    }

    private _renderCategory(category) {
        const firstThreeSubTopics = category.topTenReviewedSubTopics.slice(0, 3);

        return (
            <div key={category.id} className="category-reviews">
                <h2 className="category-heading">
                    <Link to={category.routePath} className="category-heading-link">
                        {category.name} Reviews
                    </Link>
                </h2>

                <div className="category-products">
                    <div className="category-products-inner">
                        {firstThreeSubTopics.map(product => {
                            return this._renderProduct(product);
                        })}
                    </div>
                </div>
            </div>
        );
    }

    private _renderProduct(product) {
        return (
            <div key={product.id} className="product">
                <Link to={product.routePath} className="product-photos-link">
                    {this._renderProductPhotos(product)}
                </Link>

                <Link to={product.routePath} className="product-link">
                    {product.name}
                </Link>

                <div className="product-rating">
                    <RatingStars rating={product.ratingForViewer} />
                </div>
            </div>
        );
    }

    private _renderProductPhotos(product) {
        if (!product.photoGallery.edges.length) {
            return (
                <div className="product-photos no-photos">
                </div>
            );
        }

        const [photo1, photo2, photo3] = product.photoGallery.edges;
        const getPhotoUrl = (photo) => photo.node.variations.square;

        if (!photo2 && !photo3) {
            return (
                <div className="product-photos single-product-photo">
                    <img className="product-photo" src={getPhotoUrl(photo1)} alt={product.name} />
                </div>
            )
        }

        return (
            <div className="product-photos multiple-product-photos">
                <div className="primary-photo">
                    <img className="product-photo" src={getPhotoUrl(photo1)} alt={product.name} />
                </div>

                <div className="secondary-photos">
                    <img className="product-photo" src={getPhotoUrl(photo2)} alt={product.name} />

                    {photo3 &&
                    <img className="product-photo" src={getPhotoUrl(photo3)} alt={product.name} />
                    }
                </div>
            </div>
        );
    }
}

export default Relay.createContainer(withRouter(Home), {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                ${Header.getFragment('viewer')}

                topTenCategoriesByReviews {
                    id
                    name
                    routePath

                    topTenReviewedSubTopics {
                        id
                        name
                        routePath
                        ratingForViewer

                        photoGallery(first: 3) {
                            edges {
                                node {
                                    variations {
                                        square
                                        mobileSquare
                                    }
                                }
                            }
                        }
                    }

                }
            }
        `,

        currentUser: () => Relay.QL`
            fragment on UserInterface {
                ${Header.getFragment('currentUser')}
            }
        `
    }
});
