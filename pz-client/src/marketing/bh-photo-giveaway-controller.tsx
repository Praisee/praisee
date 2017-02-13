import * as React from 'react';
import * as Relay from 'react-relay';
import appInfo from 'pz-client/src/app/app-info';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import Helmet from 'react-helmet';

interface IProps {
}

export default class BhPhotoGiveawayController extends React.Component<IProps, any> {
    render() {
        const imageUrl = appInfo.addresses.getImageFullUrl(
            'marketing/bh-photo-giveaway-thumb.jpg'
        );

        return (
            <div className="bh-photo-giveaway-namespace">
                {this._renderPageHead()}

                <img src={imageUrl} alt="$100 B&H Photo Gift Card Giveaway" className="contest-hero-image"/>

                {this._renderContest()}
            </div>
        );
    }

    private _renderPageHead() {
        const title = `$100 B&H Photo Gift Card Giveaway`;
        const description = 'Enter to win a $100 B&H Photo gift card by reviewing the gear you own';

        const imageUrl = appInfo.addresses.getImageFullUrl(
            'marketing/bh-photo-giveaway-thumb.jpg'
        );

        return (
            <Helmet
                title={title}

                meta={[
                    {name: 'description', content: description},

                    // Schema.org markup for Google
                    {itemprop: 'name', content: title},
                    {itemprop: 'description', content: description},
                    {itemprop: 'image', content: imageUrl},

                    // Open Graph Data
                    {property: 'og:title', content: title},
                    {property: 'og:type', content: 'article'},
                    {property: 'og:image', content: imageUrl},
                    {property: 'og:description', content: description},

                    // Twitter markup
                    {property: 'twitter:title', content: title},
                    {property: 'twitter:description', content: description},
                    {property: 'twitter:image:src', content: imageUrl},
                ]}
            />
        );
    }

    private _renderContest() {
        const contestHtml = `
            <a class="e-widget no-button" href="https://gleam.io/14zUs/praisee-100-bh-photo-giveaway" rel="nofollow">Praisee $100 B&amp;H Photo Giveaway</a>
        `;

        return (
            <div className="contest-container">
                <Helmet
                    script={[
                        {src: 'https://js.gleam.io/e.js', type: 'text/javascript', async: true},
                    ]}
                />

                <div className="contest" dangerouslySetInnerHTML={{__html: contestHtml}} />
            </div>
        );
    }
}
