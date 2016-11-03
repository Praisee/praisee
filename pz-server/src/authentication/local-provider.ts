/**
 * Local (username/password) authentication provider for Passport.
 *
 * This comes from loopback-component-passport. Unfortunately, due to bugs (no
 * ability to disable email verification) and limitations (cannot provide JSON as
 * a response), we're going to spin our own version of it.
 */

import {IUser, IUserInstance} from 'pz-server/src/authentication/user';

var passport = require('passport');
var LocalStrategy = require('passport-local');

export default function provideLocalAuth(app: IApp, userModel: IUser, options: any) {
    var authPath = options.authPath;

    var checkEmailAndPassword = (email, password, done) => {
        const lowercaseEmail = email && email.toLowerCase();

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
                return done(null, false, { message: errorMsg });
            }

            var userJson = user.toJSON();

            delete userJson.password;

            var userProfile = {
                provider: 'local',
                id: userJson.id,
                username: userJson.username,
                emails: [
                    {
                        value: userJson.email,
                    },
                ],
                status: userJson.status,
                accessToken: null,
            };

            // If we need a token as well, authenticate using Loopbacks
            // own login system, else defer to a simple password check
            // will grab user info from providers.json file.  Right now
            // this only can use email and username, which are the 2 most common
            if (options.setAccessToken) {
                var login = (creds) => {
                    userModel.login(creds, (error: any, accessToken) => {
                        if (error) {
                            return error.code === 'LOGIN_FAILED' ?
                                done(null, false, { message: 'Failed to create token.' }) :
                                done(error);
                        }

                        // TODO: Disabling hardcoded email verification
                        // if (accessToken && user.emailVerified) {
                        if (accessToken) {
                            userProfile.accessToken = accessToken;
                            done(null, userProfile, { accessToken: accessToken });
                        } else {
                            done(null, false, { message: 'Failed to create token.' });
                        }
                    });
                };

                switch (options.usernameField) {
                    case  'email':
                        login({ email, password: password });
                        break;
                    case 'username':
                        login({ username: email, password: password });
                        break;
                }

            } else {
                return user.hasPassword(password, (error, ok) => {
                    // Fail to login if email is not verified or invalid username/password.
                    // Unify error message in order not to give indication about the error source for
                    // security purposes.

                    // TODO: Disabling hardcoded email verification
                    // if (ok && user.emailVerified) {
                    if (ok) {
                        return done(null, userProfile);
                    }

                    done(null, false, { message: errorMsg });
                });
            }
        });
    };

    var strategy = new LocalStrategy(Object.assign({}, {
            usernameField: options.usernameField || 'username',
            passwordField: options.passwordField || 'password',
            session: options.session, authInfo: true,
        }, options), checkEmailAndPassword
    );

    passport.use('local', strategy);

    app.post(authPath, (request, response, next) => {
        const callback = (error, user, info) => {
            if (error) {
                return next(error);
            }

            if (!user) {
                return response.json({
                    success: false
                });
            }

            request.login(user, function(error) {
                if (error) {
                    return next(error);
                }

                return response.json({
                    success: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        emails: user.emails
                    }
                });
            });
        };

        passport.authenticate('local', callback)(request, response, next);
    });

    return strategy;
}

