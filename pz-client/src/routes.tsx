import * as React from 'react';
import {Router, Route, IndexRoute} from 'react-router';
import AppController from 'pz-client/src/app.controller';
import HomeController from 'pz-client/src/home.controller';
import ProfileController from 'pz-client/src/home.controller';
import CommunityItemController from 'pz-client/src/home.controller';
import ReviewController from 'pz-client/src/home.controller';
import ComparisonController from 'pz-client/src/home.controller';
import TopicController from 'pz-client/src/topic/topic.controller';

export default (
    <Router>
        <Route path="/" component={AppController}>
            <IndexRoute component={HomeController} />
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

//praisee.com/author-name/name-of-content
