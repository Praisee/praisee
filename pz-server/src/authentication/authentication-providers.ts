import appInfo from 'pz-server/src/app/app-info';

//Helpful documentation/example: http://loopback.io/doc/en/lb2/Configuring-providers.json.html
//TODO: *SECURITY* - Get ClientID and clientSecret from environment settings
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
        'session': true,
        'clientID': '1839998756255588',
        'clientSecret': 'bad8f51f894c7b7c46b7f3d8b02b803e',
        'callbackURL': appInfo.addresses.getUrlBase() + appInfo.addresses.getFacebookAuthCallbackRoute(),
        'authPath': appInfo.addresses.getFacebookAuthRoute(),
        'callbackPath': appInfo.addresses.getFacebookAuthCallbackRoute(),
        'successRedirect': '/',
        'scope': ['email', 'public_profile', 'user_friends'],
        'profileFields': ['email', 'id', 'displayName', 'photos']
    },
    'facebook-link': {
        'provider': 'facebook',
        'module': 'passport-facebook',
        'clientID': '1839998756255588',
        'clientSecret': 'bad8f51f894c7b7c46b7f3d8b02b803e',
        'callbackURL': appInfo.addresses.getUrlBase() + appInfo.addresses.getFacebookLinkCallbackRoute(),
        'authPath': appInfo.addresses.getFacebookLinkRoute(),
        'callbackPath': appInfo.addresses.getFacebookLinkCallbackRoute(),
        'successRedirect': '/',
        'scope': ['email', 'public_profile', 'user_friends'],
        'link': true
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
