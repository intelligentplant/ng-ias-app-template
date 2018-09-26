import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {

    loginUrl: '',
    clientId: '',
    oidc: false,
    requestAccessToken: true,
    scope: '',
    redirectUri: window.location.origin + '/login-callback'

};
