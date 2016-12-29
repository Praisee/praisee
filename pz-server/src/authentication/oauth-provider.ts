import { IUserInstance } from 'pz-server/src/models/user';
import { IUser } from 'pz-server/src/authentication/user';

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

export default function provideFacebookAuth(app: IApp, userModel: IUser, options: any) {

    var onLoginSuccess = (req, accessToken, refreshToken, profile, done) => {
        const lowercaseEmail = profile.emails && profile.emails[0].value.toLowerCase();

        var query = {
            where: {
                or: [
                    { username: lowercaseEmail },
                    { email: lowercaseEmail },
                ],
            },
        };

        userModel.findOne(query, (error, user: IUserInstance) => {
            if (error) {
                return done(error);
            }

            var errorMsg = 'Invalid username/password or email has not been verified';

            if (!user) {
                let userData = {
                    id: profile.id,
                    displayName: profile.displayName,
                    email: lowercaseEmail,
                    password: 'dsa'
                };

                return userModel.create(userData, (error, user) => {
                    if (error) return done(error);



                    return done(null, user);
                });
            }

            var userJson = user.toJSON();

            delete userJson.password;

            var userProfile = {
                provider: options.provider,
                id: userJson.id,
                username: userJson.username,
                emails: profile.emails,
                status: userJson.status,
                accessToken: accessToken,
                refreshToken: refreshToken,
            };

            done(null, userProfile);
        });
    };

    var facebookOptions = Object.assign({}, {
        clientID: options.clientID,
        clientSecret: options.clientSecret,
        callbackURL: options.callbackURL,
        passReqToCallback: true,
        profileFields: ['id', 'displayName', 'photos', 'email']
    }, options);

    var facebookStrategy = new FacebookStrategy(
        facebookOptions,
        onLoginSuccess
    );

    passport.use(facebookStrategy);

    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at
    //     /auth/facebook/callback
    app.get(options.authPath, passport.authenticate(options.provider, { scope: options.scope }));

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get(options.callbackPath,
        passport.authenticate(options.provider, {
            successRedirect: '/',
            failureRedirect: '/?showLogin=true'
        }));

    return facebookStrategy;
}


function createNewUserFromProfile(profile, userModel, done) {
    const lowercaseEmail = profile.emails && profile.emails[0] && profile.emails[0].value.toLowerCase();

    let userData = {
        id: profile.id,
        displayName: profile.displayName,
        email: lowercaseEmail,
        password: 'dsa'
    };

    return userModel.create(userData, (error, user) => {
        if (error) return done(error);


        return done(null, user);
    });
}

function createNewExternalCredential(userId, provider, authScheme, profile, credentials, options, cb){
    userCredentialModel.findOne({
        where: {
            userId: userId,
            provider: provider,
            externalId: profile.id,
        }
    }, function (err, extCredential) {
        if (err) {
            return cb(err);
        }

        var date = new Date();
        if (extCredential) {
            // Find the user for the given extCredential
            extCredential.credentials = credentials;
            return extCredential.updateAttributes({
                profile: profile,
                credentials: credentials, modified: date
            }, cb);
        }

        // Create the linked account
        userCredentialModel.create({
            provider: provider,
            externalId: profile.id,
            authScheme: authScheme,
            profile: profile,
            credentials: credentials,
            userId: userId,
            created: date,
            modified: date,
        }, function (err, i) {
            cb(err, i);
        });
    });
}