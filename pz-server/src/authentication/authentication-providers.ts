import appInfo from 'pz-server/src/app/app-info';

export default {
    'local': {
        'provider': 'local',
        'module': 'passport-local',
        'usernameField': 'email',
        'passwordField': 'password',
        'authPath': appInfo.addresses.getSignInApi(),
        'setAccessToken': true
    },
    'facebook-login': {
        'provider': 'facebook',
        'module': 'passport-facebook',
        'clientID': '1839998756255588',
        'clientSecret': 'bad8f51f894c7b7c46b7f3d8b02b803e',
        'callbackURL': 'http://localhost:3000/auth/facebook/callback',
        'authPath': '/auth/facebook',
        'callbackPath': '/auth/facebook/callback',
        'successRedirect': '/',
        'scope': ['email', 'public_profile', 'user_friends']
    },
    // 'google-link': {
    //     'provider': 'google',
    //     'module': 'passport-google-oauth',
    //     'strategy': 'OAuth2Strategy',
    //     'clientID': '{google-client-id-2}',
    //     'clientSecret': '{google-client-secret-2}',
    //     'callbackURL': 'http://localhost:3000/link/google/callback',
    //     'authPath': '/link/google',
    //     'callbackPath': '/link/google/callback',
    //     'successRedirect': '/link/account',
    //     'scope': ['email', 'profile'],
    //     'link': true
    // }
}
