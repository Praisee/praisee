import authProvidersConfig from 'pz-server/src/auth-providers';
import provideLocalAuth from 'pz-server/src/authentication/local-provider';

var loopback = require('loopback');
var loopbackPassport = require('loopback-component-passport');

const PassportConfigurator = loopbackPassport.PassportConfigurator;

export class AuthenticationInitializer {
    private _app: IApp;
    
    constructor(app: IApp) {
        this._app = app;
    }
    
    initialize() {
        this._app.enableAuth();
        this._initializeTokenMiddleware();
        this._initializeSessionMiddleware();
        this._configurePassport();
        this._provideAuthStrategies();
    }
    
    _initializeTokenMiddleware() {
        this._app.middleware('auth', loopback.token({
            model: this._app.models.AccessToken,
        }));
    }
    
    _initializeSessionMiddleware() {
        this._app.middleware('session:before', loopback.cookieParser(
            this._app.get('cookieSecret')
        ));
        
        this._app.middleware('session', loopback.session({
            secret: "secrets don't make friends", // TODO: This should come from a environment variable
            saveUninitialized: true,
            resave: true
        }));
    }
    
    _configurePassport() {
        const passportConfigurator = new PassportConfigurator(this._app);

        passportConfigurator.init();

        passportConfigurator.setupModels({
            userModel: this._app.models.User,
            userIdentityModel: this._app.models.UserIdentity,
            userCredentialModel: this._app.models.UserCredential
        });
    }
    
    _provideAuthStrategies() {
        provideLocalAuth(this._app, this._app.models.User, authProvidersConfig.local);
    }
}

module.exports = function initializeAuthentication(app: IApp) {
    let initializer = new AuthenticationInitializer(app);
    initializer.initialize();
};
