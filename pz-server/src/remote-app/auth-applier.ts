export interface IAuthCallback {
    (authedLoopbackApp?: IApp): any | Promise<any>
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
    accessToken: string,
    aroundCallback: IAuthCallback
): any | Promise<any> {
    
    // See https://github.com/strongloop/strong-remoting/issues/105#issuecomment-88886695
    // for details on how this works.
    let connectorRemotes = loopbackApp.dataSources[remoteName].connector.remotes;
    
    const priorAuthOptions = connectorRemotes.auth;
    
    connectorRemotes.auth = {
        bearer: new Buffer(accessToken).toString('base64'),
        sendImmediately: true
    };
    
    let result;
    
    try {
        result = aroundCallback(loopbackApp);
        
    } catch(error) {
        connectorRemotes.auth = priorAuthOptions;
        throw error;
    }
    
    if (!(result instanceof Promise)) {
        connectorRemotes.auth = priorAuthOptions;
        
        return result;
    }
    
    return (result
        .then((result) => {
            connectorRemotes.auth = priorAuthOptions;
            return result;
        })
        .catch(error => {
            connectorRemotes.auth = priorAuthOptions;
            throw error;
        })
    );
}
