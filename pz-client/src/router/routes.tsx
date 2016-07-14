import * as React from 'react';
import {Router, Route, IndexRoute} from 'react-router';
import {viewerQuery, IRouteQuery} from 'pz-client/src/router/route-queries';

import AppController from 'pz-client/src/app/app.controller';
import HomeController from 'pz-client/src/home.controller';
import ProfileController from 'pz-client/src/home.controller';
import CommunityItemController from 'pz-client/src/home.controller';
import ReviewController from 'pz-client/src/home.controller';
import ComparisonController from 'pz-client/src/home.controller';
import TopicController from 'pz-client/src/topic/topic.controller';

export default (
    <Router>
        <Route path="/" component={AppController}>
            <IndexRoute
                component={HomeController}
                {...mixinRouteQuery(viewerQuery)}
            />
            
            <Route path="profile/:usernameSlug" component={ProfileController} />
            
            <Route path="review/:contentTitleSlug" component={CommunityItemController} />
            <Route path="question/:contentTitleSlug" component={CommunityItemController} />
            <Route path="how-to/:contentTitleSlug" component={CommunityItemController} />
            <Route path="comparison/:contentTitleSlug" component={CommunityItemController} />
            
            <Route path="(:topicSlug)-reviews" component={ReviewController} />
            <Route path="(:topicSlug)-comparisons" component={ComparisonController} />
            <Route path="(:topicSlug)-questions" component={ComparisonController} />
            <Route path="(:topicSlug)-how-tos" component={ComparisonController} />
            <Route path="(:topicSlug)" component={TopicController} >
                
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

