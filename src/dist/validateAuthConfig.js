"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthConfig = void 0;
function stringIsUnset(value) {
    const unset = ['', undefined, null];
    return unset.includes(value);
}
function validateAuthConfig(config) {
    if (stringIsUnset(config === null || config === void 0 ? void 0 : config.clientId))
        throw Error("'clientId' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (stringIsUnset(config === null || config === void 0 ? void 0 : config.authorizationEndpoint))
        throw Error("'authorizationEndpoint' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (stringIsUnset(config === null || config === void 0 ? void 0 : config.tokenEndpoint))
        throw Error("'tokenEndpoint' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (stringIsUnset(config === null || config === void 0 ? void 0 : config.redirectUri))
        throw Error("'redirectUri' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (!['session', 'local'].includes(config.storage))
        throw Error("'storage' must be one of ('session', 'local')");
    if (config === null || config === void 0 ? void 0 : config.extraAuthParams)
        console.warn("The 'extraAuthParams' configuration parameter will be deprecated. You should use " +
            "'extraTokenParameters' instead.");
    if ((config === null || config === void 0 ? void 0 : config.extraAuthParams) && (config === null || config === void 0 ? void 0 : config.extraTokenParameters))
        console.warn("Using both 'extraAuthParams' and 'extraTokenParameters' is not recommended. " +
            "They do the same thing, and you should only use 'extraTokenParameters'");
}
exports.validateAuthConfig = validateAuthConfig;
