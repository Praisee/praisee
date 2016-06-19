import * as Relay  from 'react-relay';

export interface IRouteQuery {
    queries: {
        [queryName: string]: any
    }

    createParams?: (params, location) => {}
}

export const viewerQuery: IRouteQuery = {
    queries: {
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `
    }
};

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
