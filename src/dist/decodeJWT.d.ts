import { TTokenData } from './Types';
/**
 * Decodes the base64 encoded JWT. Returns a TToken.
 */
export declare const decodeJWT: (token: string) => TTokenData;
