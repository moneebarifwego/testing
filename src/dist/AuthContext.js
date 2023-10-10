"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = exports.AuthContext = void 0;
const react_1 = __importStar(require("react")); // eslint-disable-line
const authentication_1 = require("./authentication");
const Hooks_1 = __importDefault(require("./Hooks"));
const validateAuthConfig_1 = require("./validateAuthConfig");
const timeUtils_1 = require("./timeUtils");
const decodeJWT_1 = require("./decodeJWT");
const errors_1 = require("./errors");
exports.AuthContext = (0, react_1.createContext)({
    token: '',
    login: () => null,
    logOut: () => null,
    error: null,
    loginInProgress: false,
    refreshToken: ''

});
const AuthProvider = ({ authConfig, children }) => {
    // Set default values for internal config object
    const { autoLogin = true, clearURL = true, decodeToken = true, scope = '', preLogin = () => null, postLogin = () => null, onRefreshTokenExpire = undefined, storage = 'local', } = authConfig;
    const config = Object.assign(Object.assign({}, authConfig), { autoLogin: autoLogin, clearURL: clearURL, decodeToken: decodeToken, scope: scope, preLogin: preLogin, postLogin: postLogin, onRefreshTokenExpire: onRefreshTokenExpire, storage: storage });
    (0, validateAuthConfig_1.validateAuthConfig)(config);
    const [refreshToken, setRefreshToken] = (0, Hooks_1.default)('ROCP_refreshToken', undefined, config.storage);
    const [refreshTokenExpire, setRefreshTokenExpire] = (0, Hooks_1.default)('ROCP_refreshTokenExpire', (0, timeUtils_1.epochAtSecondsFromNow)(2 * timeUtils_1.FALLBACK_EXPIRE_TIME), config.storage);
    const [token, setToken] = (0, Hooks_1.default)('ROCP_token', '', config.storage);
    const [tokenExpire, setTokenExpire] = (0, Hooks_1.default)('ROCP_tokenExpire', (0, timeUtils_1.epochAtSecondsFromNow)(timeUtils_1.FALLBACK_EXPIRE_TIME), config.storage);
    const [idToken, setIdToken] = (0, Hooks_1.default)('ROCP_idToken', undefined, config.storage);
    const [loginInProgress, setLoginInProgress] = (0, Hooks_1.default)('ROCP_loginInProgress', false, config.storage);
    const [refreshInProgress, setRefreshInProgress] = (0, Hooks_1.default)('ROCP_refreshInProgress', false, config.storage);
    const [tokenData, setTokenData] = (0, react_1.useState)();
    const [idTokenData, setIdTokenData] = (0, react_1.useState)();
    const [error, setError] = (0, react_1.useState)(null);
    let interval;
    function clearStorage() {
        setRefreshToken(undefined);
        setToken('');
        setTokenExpire((0, timeUtils_1.epochAtSecondsFromNow)(timeUtils_1.FALLBACK_EXPIRE_TIME));
        setRefreshTokenExpire((0, timeUtils_1.epochAtSecondsFromNow)(timeUtils_1.FALLBACK_EXPIRE_TIME));
        setIdToken(undefined);
        setTokenData(undefined);
        setIdTokenData(undefined);
        setLoginInProgress(false);
    }
    function logOut(state, logoutHint) {
        clearStorage();
        setError(null);
        if (config === null || config === void 0 ? void 0 : config.logoutEndpoint)
            (0, authentication_1.redirectToLogout)(config, token, refreshToken, idToken, state, logoutHint);
    }
    function login(state) {
        clearStorage();
        setLoginInProgress(true);
        // TODO: Raise error on wrong state type in v2
        let typeSafePassedState = state;
        if (typeof state !== 'string') {
            console.warn(`Passed login state must be of type 'string'. Received '${state}'. Ignoring value...`);
            typeSafePassedState = undefined;
        }
        (0, authentication_1.redirectToLogin)(config, typeSafePassedState).catch((error) => {
            console.error(error);
            setError(error.message);
            setLoginInProgress(false);
        });
    }
    function handleTokenResponse(response) {
        var _a, _b, _c;
        setToken(response.access_token);
        setRefreshToken(response.refresh_token);
        const tokenExpiresIn = (_b = (_a = config.tokenExpiresIn) !== null && _a !== void 0 ? _a : response.expires_in) !== null && _b !== void 0 ? _b : timeUtils_1.FALLBACK_EXPIRE_TIME;
        setTokenExpire((0, timeUtils_1.epochAtSecondsFromNow)(tokenExpiresIn));
        const refreshTokenExpiresIn = (_c = config.refreshTokenExpiresIn) !== null && _c !== void 0 ? _c : (0, timeUtils_1.getRefreshExpiresIn)(tokenExpiresIn, response);
        setRefreshTokenExpire((0, timeUtils_1.epochAtSecondsFromNow)(refreshTokenExpiresIn));
        setIdToken(response.id_token);
        try {
            if (response.id_token)
                setIdTokenData((0, decodeJWT_1.decodeJWT)(response.id_token));
        }
        catch (e) {
            console.warn(`Failed to decode idToken: ${e.message}`);
        }
        try {
            if (config.decodeToken)
                setTokenData((0, decodeJWT_1.decodeJWT)(response.access_token));
        }
        catch (e) {
            console.warn(`Failed to decode access token: ${e.message}`);
        }
    }
    function handleExpiredRefreshToken(initial = false) {
        // If it's the first page load, OR there is no sessionExpire callback, we trigger a new login
        if (initial)
            return login();
        // TODO: Breaking change - remove automatic login during ongoing session
        else if (!onRefreshTokenExpire)
            return login();
        else
            return onRefreshTokenExpire({ login });
    }
    function refreshAccessToken(initial = false) {
        // Only refresh if no other instance (tab) is currently refreshing, or it's initial page load
        if (token && (0, timeUtils_1.epochTimeIsPast)(tokenExpire) && (!refreshInProgress || initial)) {
            // We have a refreshToken, and it is not expired
            if (refreshToken && !(0, timeUtils_1.epochTimeIsPast)(refreshTokenExpire)) {
                setRefreshInProgress(true);
                (0, authentication_1.fetchWithRefreshToken)({ config, refreshToken })
                    .then((result) => handleTokenResponse(result))
                    .catch((error) => {
                    if (error instanceof errors_1.FetchError) {
                        // If the fetch failed with status 400, assume expired refresh token
                        if (error.status === 400) {
                            return handleExpiredRefreshToken(initial);
                        }
                        // Unknown error. Set error, and login if first page load
                        else {
                            console.error(error);
                            setError(error.message);
                            if (initial)
                                login();
                        }
                    }
                    // Unknown error. Set error, and login if first page load
                    else if (error instanceof Error) {
                        console.error(error);
                        setError(error.message);
                        if (initial)
                            login();
                    }
                })
                    .finally(() => {
                    setRefreshInProgress(false);
                });
            }
            // The refreshToken has expired
            else {
                return handleExpiredRefreshToken(initial);
            }
        }
        // The token has not expired. Do nothing
        return;
    }
    // Register the 'check for soon expiring access token' interval (Every 10 seconds)
    (0, react_1.useEffect)(() => {
        interval = setInterval(() => refreshAccessToken(), 10000); // eslint-disable-line
        return () => clearInterval(interval);
    }, [token, refreshToken, refreshTokenExpire, tokenExpire]); // Replace the interval with a new when values used inside refreshAccessToken changes
    // This ref is used to make sure the 'fetchTokens' call is only made once.
    // Multiple calls with the same code will, and should, return an error from the API
    // See: https://beta.reactjs.org/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development
    const didFetchTokens = (0, react_1.useRef)(false);
    // Runs once on page load
    (0, react_1.useEffect)(() => {
        if (loginInProgress) {
            // The client has been redirected back from the Auth endpoint with an auth code
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.get('code')) {
                // This should not happen. There should be a 'code' parameter in the url by now..."
                const error_description = urlParams.get('error_description') || 'Bad authorization state. Refreshing the page might solve the issue.';
                console.error(error_description);
                setError(error_description);
                logOut();
            }
            else if (!didFetchTokens.current) {
                didFetchTokens.current = true;
                try {
                    (0, authentication_1.validateState)(urlParams);
                }
                catch (e) {
                    console.error(e);
                    setError(e.message);
                }
                // Request token from auth server with the auth code
                (0, authentication_1.fetchTokens)(config)
                    .then((tokens) => {
                    handleTokenResponse(tokens);
                    // Call any postLogin function in authConfig
                    if (config === null || config === void 0 ? void 0 : config.postLogin)
                        config.postLogin();
                })
                    .catch((error) => {
                    console.error(error);
                    setError(error.message);
                })
                    .finally(() => {
                    if (config.clearURL) {
                        // Clear ugly url params
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                    setLoginInProgress(false);
                });
            }
        }
        else if (!token) {
            // First page visit
            if (config.autoLogin)
                login();
        }
        else {
            if (decodeToken) {
                try {
                    setTokenData((0, decodeJWT_1.decodeJWT)(token));
                    if (idToken)
                        setIdTokenData((0, decodeJWT_1.decodeJWT)(idToken));
                }
                catch (e) {
                    setError(e.message);
                }
            }
            refreshAccessToken(true); // Check if token should be updated
        }
    }, []); // eslint-disable-line
    return (react_1.default.createElement(exports.AuthContext.Provider, { value: { token, tokenData, idToken, idTokenData, login, logOut, error, loginInProgress, refreshToken } }, children));
};
exports.AuthProvider = AuthProvider;
