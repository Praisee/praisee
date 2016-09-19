import * as React from 'react';
import {Router, Route, IndexRoute} from 'react-router';
import {
    IRouteQuery,
    homeQuery,
    appQuery,
    topicQuery,
    createItemQuery,
    communityItemQuery
} from 'pz-client/src/router/route-queries';

import AppController from 'pz-client/src/app/app.controller';
import AppLayout from 'pz-client/src/app/layout/app-layout.controller';
import HomeController from 'pz-client/src/home/home.controller';
import {SignInController, SignUpController} from 'pz-client/src/user/sign-in-up.controller';
import ProfileController from 'pz-client/src/home/home.controller';
import CommunityItemController from 'pz-client/src/community-item/community-item-page-component';
import ReviewController from 'pz-client/src/home/home.controller';
import ComparisonController from 'pz-client/src/home/home.controller';
import TopicController from 'pz-client/src/topic/topic.controller';

// TODO: Remove this
import {CreateItemEditor} from 'pz-client/src/editor/proofofconcept/editor.controller';

export default (
    <Router>
        <Route path="/" component={AppController as any}>

            <IndexRoute
                component={HomeController}
                {...mixinRouteQuery(homeQuery)}
            />

            <Route component={AppLayout} {...mixinRouteQuery(appQuery)}>

                {/* TODO: Remove this shit */}
                <Route
                    path="editor-poc"
                    component={CreateItemEditor}
                    {...mixinRouteQuery(createItemQuery)}
                />

                <Route path="user/sign-in" component={SignInController} />
                <Route path="user/sign-up" component={SignUpController} />

                <Route path="profile/:urlSlug" component={ProfileController} />

                <Route path="on/:urlSlug" component={CommunityItemController} {...mixinRouteQuery(communityItemQuery)} />

                <Route path="(:urlSlug)-reviews" component={ReviewController} />
                <Route path="(:urlSlug)-comparisons" component={ComparisonController} />
                <Route path="(:urlSlug)-questions" component={ComparisonController} />
                <Route path="(:urlSlug)-how-tos" component={ComparisonController} />

                <Route
                    path="(:urlSlug)"
                    component={TopicController}
                    {...mixinRouteQuery(topicQuery)}
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
