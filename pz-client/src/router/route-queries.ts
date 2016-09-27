import * as Relay  from 'react-relay';

export interface IRouteQuery {
    queries: {
        [queryName: string]: any
    }

    createParams?: (params, location) => {}
}

export var appQuery: IRouteQuery = {
    queries: {
        currentUser: () => Relay.QL`
            query {
                currentUser
            }
        `,
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `
    }
};

export var appLayoutQuery: IRouteQuery = {
    queries: {
        currentUser: () => Relay.QL`
            query {
                currentUser
            }
        `,
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `
    }
};

export var homeQuery: IRouteQuery = {
    queries: {
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `,

        currentUser: () => Relay.QL`
            query {
                currentUser
            }
        `
    }
};

export var topicQuery: IRouteQuery = {
    queries: {
        topic: () => Relay.QL`
            query {
                topic(urlSlug: $urlSlug)
            }
        `
    }
};

export var communityItemQuery: IRouteQuery = {
    queries: {
        communityItem: () => Relay.QL`
            query {
                communityItem(urlSlug: $urlSlug)
            }
        `
    }
}

// export var reviewQuery: IRouteQuery = {
//     queries: {
//         review: () => Relay.QL`
//             query {
//                 review(urlSlug: $urlSlug)
//             }
//         `
//     }
// };

export var createItemQuery: IRouteQuery = {
    queries: {
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `
    }
};

export var topicHomeQuery: IRouteQuery = {
    queries: {
        topic: () => Relay.QL`
            query {
                topic(urlSlug: "Praisee")
            }
        `
    }
};