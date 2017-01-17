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

export var addReviewQuery: IRouteQuery = {
    queries: {
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `
    }
};

export var topicQuery: IRouteQuery = {
    queries: {
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `,

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
};

export var editCommunityItemQuery: IRouteQuery = {
    queries: {
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `,

        communityItem: () => Relay.QL`
            query {
                communityItem(id: $id)
            }
        `
    }
};

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
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `,

        topic: () => Relay.QL`
            query {
                topic(urlSlug: "Praisee")
            }
        `
    }
};

export var profileQuery: IRouteQuery = {
    queries: {
        profile: () => Relay.QL`
            query {
                profile(urlSlug: $urlSlug)
            }
        `
    }
};
