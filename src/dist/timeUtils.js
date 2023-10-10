"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefreshExpiresIn = exports.epochTimeIsPast = exports.epochAtSecondsFromNow = exports.FALLBACK_EXPIRE_TIME = void 0;
exports.FALLBACK_EXPIRE_TIME = 600; // 10minutes
// Returns epoch time (in seconds) for when the token will expire
const epochAtSecondsFromNow = (secondsFromNow) => Math.round(Date.now() / 1000 + secondsFromNow);
exports.epochAtSecondsFromNow = epochAtSecondsFromNow;
/**
 * Check if the Access Token has expired.
 * Will return True if the token has expired, OR there is less than 30 seconds until it expires.
 */
function epochTimeIsPast(timestamp) {
    const now = Math.round(Date.now()) / 1000;
    const nowWithBuffer = now + 30;
    return nowWithBuffer >= timestamp;
}
exports.epochTimeIsPast = epochTimeIsPast;
const refreshExpireKeys = [
    'refresh_expires_in',
    'refresh_token_expires_in', // Azure AD
];
function getRefreshExpiresIn(tokenExpiresIn, response) {
    for (const key of refreshExpireKeys) {
        if (key in response)
            return response[key];
    }
    return tokenExpiresIn + exports.FALLBACK_EXPIRE_TIME;
}
exports.getRefreshExpiresIn = getRefreshExpiresIn;
