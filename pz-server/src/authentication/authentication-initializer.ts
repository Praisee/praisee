import authProvidersConfig from 'pz-server/src/authentication/authentication-providers';
import provideLocalAuth from 'pz-server/src/authentication/local-provider';
import appInfo from 'pz-server/src/app/app-info';

var loopback = require('loopback');
var cookieParser = require('cookie-parser');
var session = require('express-session');
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
        this._createRedirectRoute();
    }

    _initializeTokenMiddleware() {
        this._app.middleware('auth', loopback.token({
            model: this._app.models.AccessToken,
        }));
    }

    _initializeSessionMiddleware() {
        const secret = "secrets don't make friends";// TODO: *SECURITY* - This should come from a environment variable
        this._app.middleware('session:before', cookieParser(secret));

        this._app.middleware('session', session({
            secret: secret,
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

        let profileToUser = function (provider, profile, options) {
            var email = profile.emails && profile.emails[0] && profile.emails[0].value;
            var username = provider + '.' + (profile.username || profile.id);
            let displayName = profile.displayName;

            var password = 'a'; //Since pw's are compared via hash 'a' will not be hashed to. Should be an impossible hash
            var userObj = {
                email,
                password,
                displayName
            };

            return userObj;
        }

        for (let provider in authProvidersConfig) {
            if (provider === 'local')
                continue;

            let config = authProvidersConfig[provider];
            
            config.profileToUser = profileToUser;
            config.session = config.session !== false;
            configurator.configureProvider(provider, config);
        }
    }

    _createRedirectRoute(){
        this._app.get(appInfo.addresses.getLoginSuccessRoute(), (request, response) => {
            response.send(`<script>
                (function(){
                    window.opener.refreshUser();
                    window.opener.focus();
                    window.close();
                })()
            </script>`)
        })
    }
}

module.exports = function initializeAuthentication(app: IApp) {
    let initializer = new AuthenticationInitializer(app);
    initializer.initialize();
};
