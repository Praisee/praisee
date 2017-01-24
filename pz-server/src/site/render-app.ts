import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';

// We need to use these dependencies from pz-client, otherwise we'll run into an
// `instanceof` bug.
// See https://github.com/denvned/isomorphic-relay/issues/10#issuecomment-227966031
import * as Relay from 'react-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import IsomorphicContext from 'pz-client/src/app/isomorphic-context.component';
import {startBenchmark, endBenchmark} from 'pz-server/src/support/benchmark';
import serverInfo from 'pz-server/src/app/server-info';
import Helmet from 'react-helmet';

const GRAPHQL_URL = `http://${serverInfo.getHost()}/i/graphql`; // TODO: Unhardcode this

export default function renderApp(request, response, renderProps, next) {
    if (process.env.NO_ISOMORPHIC || request.query.disableServerRender === 'true') {
        response.render('site/layout', {
            isProductionEnv: serverInfo.isProductionEnv(),
            cache: true,
            cachedRequestData: 'null',
            headContent: {},
            content: ''
        });

        return;
    }

    const graphqlNetworkLayer = new Relay.DefaultNetworkLayer(GRAPHQL_URL, {
        headers: request.headers
    });

    let dataPrepBenchmark;

    (Promise.resolve()
            .then(() => {
                dataPrepBenchmark = startBenchmark('Prepare Relay Data');
                return IsomorphicRouter.prepareData(renderProps, graphqlNetworkLayer);
            })

            .then(({data, props}) => {
                endBenchmark(dataPrepBenchmark);

                const router = IsomorphicRouter.render(props);

                let hasError = false;

                var isomorphicContext = React.createElement(IsomorphicContext, {
                    children: router,

                    notFoundHandler: () => {
                        hasError = true;
                    }
                });

                let renderBenchmark = startBenchmark('Render React Site Content');

                const content = ReactDomServer.renderToString(isomorphicContext);
                const headContent = Helmet.rewind();

                endBenchmark(renderBenchmark);

                if (!hasError) {
                    response.render('site/layout', {
                        isProductionEnv: serverInfo.isProductionEnv(),
                        cache: true,
                        cachedRequestData: JSON.stringify(data),

                        headContent: {
                            htmlAttributes: headContent.htmlAttributes.toString(),
                            title: headContent.title.toString(),
                            base: headContent.base.toString(),
                            meta: headContent.meta.toString(),
                            link: headContent.link.toString(),
                            script: headContent.script.toString(),
                            noscript: headContent.noscript.toString(),
                            style: headContent.style.toString()
                        },

                        content: content
                    });

                } else {

                    next();
                }
            })

            .catch((error) => {
                if (error.response && error.response.text) {
                    error.response.text().then(console.error);
                }

                next(error);
            })
    );
}
