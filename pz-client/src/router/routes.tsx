import * as React from 'react';
import { Router, Route, IndexRoute, IndexRedirect } from 'react-router';

import {
    IRouteQuery,
    homeQuery,
    appQuery,
    appLayoutQuery,
    topicQuery,
    createItemQuery,
    communityItemQuery,
    topicHomeQuery
} from 'pz-client/src/router/route-queries';

import AppController from 'pz-client/src/app/app.controller';
import AppLayout from 'pz-client/src/app/layout/app-layout.controller';
import HomeController from 'pz-client/src/home/home.controller';
import { SignInController, SignUpController } from 'pz-client/src/user/sign-in-up.controller';
import ProfileController from 'pz-client/src/home/home.controller';
import CommunityItemController from 'pz-client/src/community-item/community-item-controller';
import ReviewController from 'pz-client/src/home/home.controller';
import ComparisonController from 'pz-client/src/home/home.controller';
import TopicController from 'pz-client/src/topic/topic.controller';

// TODO: Remove this
import { CreateItemEditor } from 'pz-client/src/editor/proofofconcept/editor.controller';

export default (
    <Router>
        <Route path="/" component={AppController as any} {...mixinRouteQuery(appQuery) } >

            {/*<IndexRoute component={HomeController} {...mixinRouteQuery(homeQuery)} />*/}

            <Route component={AppLayout} {...mixinRouteQuery(appLayoutQuery) }>
                {/* TODO: Remove this shit */}
                <IndexRoute component={TopicController} {...mixinRouteQuery(topicHomeQuery)} />

                {/* TODO: Remove this shit */}
                <Route
                    path="editor-poc"
                    component={CreateItemEditor}
                    {...mixinRouteQuery(createItemQuery) }
                    />

                <Route path="user/sign-in" component={SignInController} />
                <Route path="user/sign-up" component={SignUpController} />

                <Route path="profile/:urlSlug" component={ProfileController} />

                <Route path="on/:urlSlug" component={CommunityItemController} {...mixinRouteQuery(communityItemQuery) } />

                {/*<Route path="(:urlSlug)-reviews" component={ReviewController} />*/}
                {/*<Route path="(:urlSlug)-comparisons" component={ComparisonController} />*/}
                {/*<Route path="(:urlSlug)-questions" component={ComparisonController} />*/}
                {/*<Route path="(:urlSlug)-guides" component={ComparisonController} />*/}

                <Route path="(:urlSlug)-reviews" component={TopicController} {...mixinRouteQuery(topicQuery)} />
                <Route path="(:urlSlug)-questions" component={TopicController} {...mixinRouteQuery(topicQuery)} />
                <Route path="(:urlSlug)-guides" component={TopicController} {...mixinRouteQuery(topicQuery)} />
                <Route path="(:urlSlug)-comparisons" component={TopicController} {...mixinRouteQuery(topicQuery)} />

                <Route
                    path="(:urlSlug)"
                    component={TopicController}
                    {...mixinRouteQuery(topicQuery) }
                />

            </Route>

        </Route>
    </Router>
)

function mixinRouteQuery(routeQuery: IRouteQuery): {} {
    let props: any = {
        queries: routeQuery.queries
    };

    if ('createParams' in routeQuery) {
        props.prepareParams = routeQuery.createParams;
    }

    return props;
}
