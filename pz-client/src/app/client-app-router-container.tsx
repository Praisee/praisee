import * as React from 'react';
import * as ReactRouter from 'react-router';
import IsomorphicRouter from 'isomorphic-relay-router';
import useScroll from 'react-router-scroll/lib/useScroll';

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

    constructor(){
        super();
        if(typeof(window) !== 'undefined')
            window["clearSessionData"] = this._clearSessionData.bind(this);
    }
    
    getChildContext() {
        return {
            clearSessionData: this._clearSessionData.bind(this),
            appStateLoadingStatus: this.state.appStateLoadingStatus,
            isLoadingSessionData: this.state.isLoadingSessionData
        };
    }

    render() {
        // Due to a bug in Relay, mutation functions are still bound to the old
        // Relay environment regardless of whether a new Relay Environment was
        // given to the Relay Renderer. So we need to force a full remount of the
        // React environment if the Relay Environment is replaced.
        const forceRefresh = this.state.relayEnvironmentId;

        return (
            <ReactRouter.Router
                {...this.props.routerProps}
                key={forceRefresh}
                render={applyRouterMiddleware(
                    this._routerMiddleware(),
                    useScroll()
                )}
            />
        );
    }

    state = {
        replacedRelayEnvironment: null,
        relayEnvironmentId: 1,

        appStateLoadingStatus: {
            aborted: false,
            done: true,
            error: null,
            ready: true,
            stale: false
        },

        isLoadingSessionData: false
    };

    componentDidMount() {
        console.log('App Relay Environment: window.appRelayEnv');
    }

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
        const relayEnvironment = this.state.replacedRelayEnvironment || props.environment;

        window['appRelayEnv'] = relayEnvironment;

        return {
            environment: relayEnvironment,

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

        let relayEnvironmentId = this.state.relayEnvironmentId;

        if (isLoadingSessionData !== this.state.isLoadingSessionData) {
            relayEnvironmentId = relayEnvironmentId + 1;
        }

        this.setState({
            relayEnvironmentId,

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
        });
    }
}
