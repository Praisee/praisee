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
        return (
            <div className="bh-photo-giveaway-namespace">
                <h1 className="contest-heading">$100 B&amp;H Photo Gift Card Giveaway</h1>

                {this._renderContestVideo()}

                <div className="contest-body">
                    Ready to win a $100 B&H Photo gift card? Enter to win below!
                </div>

                {this._renderContest()}
            </div>
        );
    }

    private _renderContestVideo() {
        const embeddedVideoHtml = `
            <div class="wistia_responsive_padding" style="padding:56.25% 0 0 0;position:relative;"><div class="wistia_responsive_wrapper" style="height:100%;left:0;position:absolute;top:0;width:100%;"><div class="wistia_embed wistia_async_wjn19ki9jv videoFoam=true" style="height:100%;width:100%">&nbsp;</div></div></div>
        `;

        return (
            <div className="contest-video-container">
                <Helmet
                    script={[
                        {src: '//fast.wistia.com/embed/medias/wjn19ki9jv.jsonp', type: 'text/javascript', async: true},
                        {src: '//fast.wistia.com/assets/external/E-v1.js', type: 'text/javascript', async: true},
                    ]}
                />

                <div className="contest-video" dangerouslySetInnerHTML={{__html: embeddedVideoHtml}} />
            </div>
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
