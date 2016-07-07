import applyAuth from 'pz-server/src/remote-app/auth-applier';

export interface IResolver {
    (source, args, context, ...other): any | Promise<any>
}

export function resolveWithAppAndSession(
    app: IApp,
    remoteName: string,
    resolver: IResolver
) {
    
    return (source, args, context, ...other) => {
        const {sessionAccessToken} = context;
        
        if (!sessionAccessToken) {
            return resolver(source, args, context, ...other);
        }

        return applyAuth(app, remoteName, sessionAccessToken, () => {
            return resolver(source, args, context, ...other);
        });
    }
}
