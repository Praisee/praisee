import * as React from 'react';
import {Router, Route, IndexRoute} from 'react-router';
import {
    IRouteQuery,
    homeQuery,
    appQuery,
    topicQuery,
    reviewQuery
} from 'pz-client/src/router/route-queries';

import AppController from 'pz-client/src/app/app.controller';
import AppLayout from 'pz-client/src/app/layout/app-layout.controller';
import HomeController from 'pz-client/src/home/home.controller';
import SignInController from 'pz-client/src/user/sign-in.controller';
import SignUpController from 'pz-client/src/user/sign-up.controller';
import ProfileController from 'pz-client/src/home/home.controller';
import CommunityItemController from 'pz-client/src/home/home.controller';
import ReviewController from 'pz-client/src/home/home.controller';
import ComparisonController from 'pz-client/src/home/home.controller';
import TopicController from 'pz-client/src/topic/topic.controller';

export default (
    <Router>
        <Route path="/" component={AppController}>

            <IndexRoute
                component={HomeController}
                {...mixinRouteQuery(homeQuery)}
            />

            <Route component={AppLayout} {...mixinRouteQuery(appQuery)}>
                <Route path="user/sign-in" component={SignInController} />
                <Route path="user/sign-up" component={SignUpController} />

                <Route path="profile/:usernameSlug" component={ProfileController} />

                <Route path="review/:contentTitleSlug" component={CommunityItemController} />
                <Route path="question/:contentTitleSlug" component={CommunityItemController} />
                <Route path="how-to/:contentTitleSlug" component={CommunityItemController} />
                <Route path="comparison/:contentTitleSlug" component={CommunityItemController} />

                <Route path="(:topicSlug)-reviews" component={ReviewController} />
                <Route path="(:topicSlug)-comparisons" component={ComparisonController} />
                <Route path="(:topicSlug)-questions" component={ComparisonController} />
                <Route path="(:topicSlug)-how-tos" component={ComparisonController} />

                <Route
                    path="(:topicSlug)"
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
