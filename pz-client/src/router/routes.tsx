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

import SearchController from 'pz-client/src/search-proofofconcept/search.controller'; // TODO: Remove this

export default (
    <Router>
        <Route path="/" component={AppController}>
            <IndexRoute
                component={HomeController}
                {...mixinRouteQuery(viewerQuery)}
            />
            
            <Route path="search/poc" component={SearchController} /> {/* TODO: Remove this */}
            
            <Route path="profile/:usernameSlug" component={ProfileController} />
            
            <Route path=":usernameSlug/:contentTitleSlug" component={CommunityItemController} />
            
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

