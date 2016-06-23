declare namespace ReactRouter {
    interface RouterProps {
        render?: Function
    }
}

declare module "react-router" {
    export let applyRouterMiddleware: Function
}

