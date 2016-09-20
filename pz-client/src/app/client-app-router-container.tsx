import * as React from 'react';
import * as ReactRouter from 'react-router';
import IsomorphicRouter from 'isomorphic-relay-router';

var {applyRouterMiddleware} = ReactRouter;
var {useIsoRelay} = IsomorphicRouter;

// See https://facebook.github.io/relay/docs/guides-ready-state.html
export var appStateLoadingStatusType = React.PropTypes.shape({
    aborted: React.PropTypes.bool,
    done: React.PropTypes.bool,
    error: React.PropTypes.any,
    ready: React.PropTypes.bool,
    stale: React.PropTypes.bool
});

export interface TAppStateLoadingStatus {
    aborted: boolean
    done: boolean
    error: any
    ready: boolean
    stale: boolean
}

export interface IProps {
    routerProps: any
    createRelayEnvironment: Function
}

export default class ClientAppRouterContainer extends React.Component<IProps, any> {
    static childContextTypes = {
        appStateLoadingStatus: appStateLoadingStatusType,
        clearSessionData: React.PropTypes.func,
        isLoadingSessionData: React.PropTypes.bool
    };

    getChildContext() {
        return {
            clearSessionData: this._clearSessionData.bind(this),
            appStateLoadingStatus: this.state.appStateLoadingStatus,
            isLoadingSessionData: this.state.isLoadingSessionData
        };
    }

    render() {
        return (
            <ReactRouter.Router
                {...this.props.routerProps}
                render={applyRouterMiddleware(this._routerMiddleware())}
            />
        );
    }

    state = {
        replacedRelayEnvironment: null,

        appStateLoadingStatus: {
            aborted: false,
            done: true,
            error: null,
            ready: true,
            stale: false
        },

        isLoadingSessionData: false
    };

    private _routerMiddleware() {
        return {
            renderRouterContext: (child, props) => {
                return useIsoRelay.renderRouterContext(
                    child,
                    Object.assign({}, props, this._getRelayProps(props))
                );
            },

            renderRouteComponent: useIsoRelay.renderRouteComponent
        }
    }

    private _getRelayProps(props) {
        return {
            environment: this.state.replacedRelayEnvironment || props.environment,

            onReadyStateChange: (readyState) => {
                this._provideAppStateLoadingStatus(readyState);

                if (props.onReadyStateChange) {
                    props.onReadyStateChange(readyState);
                }
            }
        };
    }

    private _provideAppStateLoadingStatus(readyState) {
        const isReady = readyState.ready;
        const isLoadingSessionData = this.state.isLoadingSessionData && !isReady;

        this.setState({
            appStateLoadingStatus: {
                aborted: readyState.aborted,
                done: readyState.done,
                error: readyState.error,
                ready: readyState.ready,
                stale: readyState.stale
            },

            isLoadingSessionData
        })
    }

    private _clearSessionData() {
        this.setState({
            replacedRelayEnvironment: this.props.createRelayEnvironment(),
            isLoadingSessionData: true
        })
    }
}