import createRemoteApp from 'pz-server/src/remote-app/app-creator';

module.exports = function setupRemoteApp(app: IApp, next: ICallback) {
    (createRemoteApp()
        .then((remoteApp: IApp) => {
            app.services.remoteApp = remoteApp;
            next(null);
        })
            
        .catch(error => next(error))
    );
};
