"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_COOKIE = exports.ACCESS_TOKEN_COOKIE = void 0;
exports.setAuthCookies = setAuthCookies;
exports.clearAuthCookies = clearAuthCookies;
exports.ACCESS_TOKEN_COOKIE = 'access_token';
exports.REFRESH_TOKEN_COOKIE = 'refresh_token';
function setAuthCookies(res, config, accessToken, refreshToken) {
    const secure = config.get('cookie.secure', false);
    const domain = config.get('cookie.domain');
    const cookieOptions = {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        ...(domain ? { domain } : {}),
    };
    res.cookie(exports.ACCESS_TOKEN_COOKIE, accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
    });
    res.cookie(exports.REFRESH_TOKEN_COOKIE, refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
function clearAuthCookies(res, config) {
    const secure = config.get('cookie.secure', false);
    const domain = config.get('cookie.domain');
    const opts = {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        ...(domain ? { domain } : {}),
    };
    res.clearCookie(exports.ACCESS_TOKEN_COOKIE, opts);
    res.clearCookie(exports.REFRESH_TOKEN_COOKIE, opts);
}
//# sourceMappingURL=cookie.util.js.map