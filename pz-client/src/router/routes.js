var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import * as React from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import { homeQuery, appQuery } from 'pz-client/src/router/route-queries';
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
export default (React.createElement(Router, null, 
    React.createElement(Route, {path: "/", component: AppController}, 
        React.createElement(IndexRoute, __assign({component: HomeController}, mixinRouteQuery(homeQuery))), 
        React.createElement(Route, __assign({component: AppLayout}, mixinRouteQuery(appQuery)), 
            React.createElement(Route, {path: "user/sign-in", component: SignInController}), 
            React.createElement(Route, {path: "user/sign-up", component: SignUpController}), 
            React.createElement(Route, {path: "profile/:usernameSlug", component: ProfileController}), 
            React.createElement(Route, {path: "review/:contentTitleSlug", component: CommunityItemController}), 
            React.createElement(Route, {path: "question/:contentTitleSlug", component: CommunityItemController}), 
            React.createElement(Route, {path: "how-to/:contentTitleSlug", component: CommunityItemController}), 
            React.createElement(Route, {path: "comparison/:contentTitleSlug", component: CommunityItemController}), 
            React.createElement(Route, {path: "(:topicSlug)-reviews", component: ReviewController}), 
            React.createElement(Route, {path: "(:topicSlug)-comparisons", component: ComparisonController}), 
            React.createElement(Route, {path: "(:topicSlug)-questions", component: ComparisonController}), 
            React.createElement(Route, {path: "(:topicSlug)-how-tos", component: ComparisonController}), 
            React.createElement(Route, __assign({path: "(:topicSlug)", component: TopicController}, mixinRouteQuery(viewerQuery)))))
));
function mixinRouteQuery(routeQuery) {
    var props = {
        queries: routeQuery.queries
    };
    if ('createParams' in routeQuery) {
        props.prepareParams = routeQuery.createParams;
    }
    return props;
}
