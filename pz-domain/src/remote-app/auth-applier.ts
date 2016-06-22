export interface IAuthOptions {
}

export interface IAuthCallback {
    (authedLoopbackApp?: IApp): void | Promise<void>
}

/**
 * This applies authentication options to a Loopback remote connector temporarily
 * (within `aroundCallback`) and then restores the previous authentication options.
 * 
 * This facilitates server-side authentication for the remote connector on a per
 * user basis.
 */
export default function applyAuth(
    loopbackApp: IApp,
    remoteName: string,
    authOptions: IAuthOptions,
    aroundCallback: IAuthCallback
): void | Promise<void> {
    
    // See https://github.com/strongloop/strong-remoting/issues/105#issuecomment-88886695
    // for details on how this works.
    let connectorRemotes = loopbackApp.dataSources[remoteName].connnector.remotes;
    
    const priorAuthOptions = connectorRemotes.auth;
    
    connectorRemotes.auth = authOptions;
    
    let nothingOrPromise;
    
    try {
        nothingOrPromise = aroundCallback(loopbackApp);
        
    } catch(error) {
        connectorRemotes.auth = priorAuthOptions;
        throw error;
    }
    
    if (!(nothingOrPromise instanceof Promise)) {
        connectorRemotes.auth = priorAuthOptions;
        
        return;
    }
    
    return (nothingOrPromise
        .then(() => {
            connectorRemotes.auth = priorAuthOptions;
        })
        .catch(error => {
            connectorRemotes.auth = priorAuthOptions;
            throw error;
        })
    );
}
