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
