import { IUserModel } from 'pz-server/src/models/user';
import authProvidersConfig from 'pz-server/src/authentication/authentication-providers';
import provideLocalAuth from 'pz-server/src/authentication/local-provider';
import provideFacebookAuth from 'pz-server/src/authentication/oauth-provider';
import appInfo from '../app/app-info';

var loopback = require('loopback');
var passport = require('passport');
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
        this._initializePassportMiddleware();
        let configurator = this._configurePassport();
        this._provideAuthStrategies(configurator);
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

    _initializePassportMiddleware() {
        this._app.middleware('session:after', passport.initialize());
        this._app.middleware('session:after', passport.session());

        // For now, we don't need to do any serialization. Sessions should really
        // be merged with access tokens, instead of having two competing concepts.
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            done(null, user);
        });

        this._app.get(appInfo.addresses.getSignOutApi(), function (request, response) {
            request.logout();
            response.redirect('/');
        });

        this._app.post(appInfo.addresses.getSignOutApi(), function (request, response) {
            request.logout();
            response.json({ success: true });
        });
    }

    _configurePassport() {
        const passportConfigurator = new PassportConfigurator(this._app);

        // We use our own passport initializer since this one
        // hydrates a user model in place of the user profile and strips away
        // our access token.
        // passportConfigurator.init();

        // We use our own setupModels to prevent Loopback from creating a PraiseeUserId foreign key
        // passportConfigurator.setupModels({
        //     userModel: this._app.models.PraiseeUser,
        //     userIdentityModel: this._app.models.UserIdentity,
        //     userCredentialModel: this._app.models.UserCredential
        // });

        //Below we are performing the same thing that "PassportConfigurator.setupModels" does
        //except we are specifying the foreignKey. See passport-configurator lines 40-66
        let userModel = this._app.models.PraiseeUser;
        let userCredentialModel = this._app.models.UserCredential;
        let userIdentityModel = this._app.models.UserIdentity;

        passportConfigurator.userModel = userModel;
        passportConfigurator.userIdentityModel = userIdentityModel;
        passportConfigurator.userCredentialModel = userCredentialModel;

        userModel.hasMany(userIdentityModel, { as: 'identities', foreignKey: "userId" });
        userModel.hasMany(userCredentialModel, { as: 'credentials', foreignKey: "userId" });

        userCredentialModel.belongsTo(userModel, { as: 'user', foreignKey: "userId" });
        userIdentityModel.belongsTo(userModel, { as: 'user', foreignKey: "userId" });

        return passportConfigurator;
    }

    _provideAuthStrategies(configurator) {
        provideLocalAuth(this._app, this._app.models.PraiseeUser, authProvidersConfig.local);

        for (let property in authProvidersConfig) {
            if (property === 'local')
                continue;

            let config = authProvidersConfig[property];
            config.session = config.session !== false;
            configurator.configureProvider(property, config);
        }
        // provideFacebookAuth(this._app, this._app.models.PraiseeUser, authProvidersConfig["facebook-login"]);
    }
}

module.exports = function initializeAuthentication(app: IApp) {
    let initializer = new AuthenticationInitializer(app);
    initializer.initialize();
};
