import * as React from 'react';
import * as Relay from 'react-relay';
import NotFoundError from 'pz-client/src/app/not-found-error.component';
import CurrentUserType from 'pz-client/src/user/current-user-type';
import Helmet from 'react-helmet';

import {
    appStateLoadingStatusType,
    TAppStateLoadingStatus
} from 'pz-client/src/app/client-app-router-container';
import appInfo from 'pz-client/src/app/app-info';

interface IContextTypes {
    notFoundHandler: Function
    appStateLoadingStatus: TAppStateLoadingStatus
}

export class App extends React.Component<any, any> {
    //set context stuff here

    static contextTypes: any = {
        notFoundHandler: React.PropTypes.func,
        appStateLoadingStatus: appStateLoadingStatusType,
        isLoadingSessionData: React.PropTypes.bool
    };

    static childContextTypes: any = {
        showNotFoundError: React.PropTypes.func,
        appViewerId: React.PropTypes.string,
        getCurrentUser: React.PropTypes.func
    };

    context: IContextTypes;

    getChildContext() {
        return {
            showNotFoundError: this._showNotFoundError.bind(this),
            appViewerId: this.props.viewer.id,
            getCurrentUser: () => this.props.currentUser,
        };
    }

    state = {
        showNotFoundError: false,
        notFoundErrorMessage: null
    };

    render() {
        let content = this.props.children;

        const appStateLoadingStatus = this.context.appStateLoadingStatus;
        const isReady = !appStateLoadingStatus || appStateLoadingStatus.ready;

        if (isReady && this.state.showNotFoundError) {
            content = this.state.notFoundErrorMessage;
        }

        return (
            <div className="app-namespace">
                {this._renderPageHead()}

                {content}
            </div>
        );
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return nextContext.isLoadingSessionData === false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.children !== this.props.children) {
            this.setState({
                showNotFoundError: false,
                notFoundErrorMessage: null
            });
        }
    }

    private _renderPageHead() {
        const defaultDescription = 'Praisee is a community dedicated to giving consumers a voice to share their reviews, ask questions and find answers to all products';

        const defaultImageUrl = appInfo.addresses.getImageFullUrl(
            'praisee-square-1024.jpg'
        );

        return (
            <Helmet
                htmlAttributes={{
                    prefix: "og: http://ogp.me/ns#"
                }}

                defaultTitle="Praisee - The One Stop Review Spot"
                titleTemplate="%s - Praisee"

                meta={[
                    {name: 'description', content: defaultDescription},

                    // Schema.org markup for Google
                    {itemprop: 'description', content: defaultDescription},
                    {itemprop: 'image', content: defaultImageUrl},

                    // Open Graph Data
                    {property: 'og:image', content: defaultImageUrl},
                    {property: 'og:description', content: defaultDescription},
                    {property: 'og:site_name', content: 'Praisee'},

                    // Twitter markup
                    {property: 'twitter:description', content: defaultDescription},
                    {property: 'twitter:image:src', content: defaultImageUrl},
                ]}
            />
        );
    }

    private _showNotFoundError(errorMessage?) {
        const notFoundErrorMessage = (
            <NotFoundError>
                {errorMessage}
            </NotFoundError>
        );

        if (this.context.notFoundHandler) {
            this.context.notFoundHandler(notFoundErrorMessage);

        } else {
            setTimeout(() => {
                this.setState({
                    showNotFoundError: true,
                    notFoundErrorMessage: notFoundErrorMessage
                });
            });
        }
    }
}

export default Relay.createContainer(App, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                id
            }
        `,
        currentUser: () => Relay.QL`
            fragment on CurrentUser {
                id
                serverId
                isLoggedIn
                displayName
                isCurrentUser
            }
        `
    }
});
