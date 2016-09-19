import appInfo from 'pz-server/src/app/app-info';

export default {
    'local': {
        'provider': 'local',
        'module': 'passport-local',
        'usernameField': 'email',
        'passwordField': 'password',
        'authPath': appInfo.addresses.getSignInApi(),
        'setAccessToken': true
    }
}
