"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateState = exports.redirectToLogout = exports.fetchWithRefreshToken = exports.fetchTokens = exports.redirectToLogin = void 0;
const pkceUtils_1 = require("./pkceUtils");
const httpUtils_1 = require("./httpUtils");
const codeVerifierStorageKey = 'PKCE_code_verifier';
const stateStorageKey = 'ROCP_auth_state';
function redirectToLogin(config, customState) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create and store a random string in sessionStorage, used as the 'code_verifier'
        const codeVerifier = (0, pkceUtils_1.generateRandomString)(96);
        sessionStorage.setItem(codeVerifierStorageKey, codeVerifier);
        // Hash and Base64URL encode the code_verifier, used as the 'code_challenge'
        return (0, pkceUtils_1.generateCodeChallenge)(codeVerifier).then((codeChallenge) => {
            // Set query parameters and redirect user to OAuth2 authentication endpoint
            const params = new URLSearchParams(Object.assign({ response_type: 'code', client_id: config.clientId, scope: config.scope, redirect_uri: config.redirectUri, code_challenge: codeChallenge, code_challenge_method: 'S256' }, config.extraAuthParameters));
            sessionStorage.removeItem(stateStorageKey);
            const state = customState !== null && customState !== void 0 ? customState : config.state;
            if (state) {
                sessionStorage.setItem(stateStorageKey, state);
                params.append('state', state);
            }
            // Call any preLogin function in authConfig
            if (config === null || config === void 0 ? void 0 : config.preLogin)
                config.preLogin();
            window.location.replace(`${config.authorizationEndpoint}?${params.toString()}`);
        });
    });
}
exports.redirectToLogin = redirectToLogin;
// This is called a "type predicate". Which allow us to know which kind of response we got, in a type safe way.
function isTokenResponse(body) {
    return body.access_token !== undefined;
}
function postTokenRequest(tokenEndpoint, tokenRequest) {
    return (0, httpUtils_1.postWithXForm)(tokenEndpoint, tokenRequest).then((response) => {
        return response.json().then((body) => {
            if (isTokenResponse(body)) {
                return body;
            }
            else {
                throw Error(body);
            }
        });
    });
}
const fetchTokens = (config) => {
    /*
      The browser has been redirected from the authentication endpoint with
      a 'code' url parameter.
      This code will now be exchanged for Access- and Refresh Tokens.
    */
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const codeVerifier = window.sessionStorage.getItem(codeVerifierStorageKey);
    if (!authCode) {
        throw Error("Parameter 'code' not found in URL. \nHas authentication taken place?");
    }
    if (!codeVerifier) {
        throw Error("Can't get tokens without the CodeVerifier. \nHas authentication taken place?");
    }
    const tokenRequest = Object.assign(Object.assign({ grant_type: 'authorization_code', code: authCode, scope: config.scope, client_id: config.clientId, redirect_uri: config.redirectUri, code_verifier: codeVerifier }, config.extraAuthParams), config.extraTokenParameters);
    return postTokenRequest(config.tokenEndpoint, tokenRequest);
};
exports.fetchTokens = fetchTokens;
const fetchWithRefreshToken = (props) => {
    const { config, refreshToken } = props;
    const refreshRequest = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: config.scope,
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
    };
    return postTokenRequest(config.tokenEndpoint, refreshRequest);
};
exports.fetchWithRefreshToken = fetchWithRefreshToken;
function redirectToLogout(config, token, refresh_token, idToken, state, logoutHint) {
    var _a;
    const params = new URLSearchParams(Object.assign({ token: refresh_token || token, token_type_hint: refresh_token ? 'refresh_token' : 'access_token', client_id: config.clientId, post_logout_redirect_uri: (_a = config.logoutRedirect) !== null && _a !== void 0 ? _a : config.redirectUri, ui_locales: window.navigator.languages.reduce((a, b) => a + ' ' + b) }, config.extraLogoutParameters));
    if (idToken)
        params.append('id_token_hint', idToken);
    if (state)
        params.append('state', state);
    if (logoutHint)
        params.append('logout_hint', logoutHint);
    window.location.replace(`${config.logoutEndpoint}?${params.toString()}`);
}
exports.redirectToLogout = redirectToLogout;
function validateState(urlParams) {
    const receivedState = urlParams.get('state');
    const loadedState = sessionStorage.getItem(stateStorageKey);
    if (receivedState !== loadedState) {
        throw new Error('"state" value received from authentication server does no match client request. Possible cross-site request forgery');
    }
}
exports.validateState = validateState;
