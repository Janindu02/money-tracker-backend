import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

function getCookieOptions(config: ConfigService) {
  const secure = config.get<boolean>('cookie.secure', false);
  const domain = config.get<string | undefined>('cookie.domain');
  const sameSite = config.get<'lax' | 'none' | 'strict'>('cookie.sameSite', 'lax');

  return {
    httpOnly: true,
    secure: sameSite === 'none' ? true : secure,
    sameSite,
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

export function setAuthCookies(
  res: Response,
  config: ConfigService,
  accessToken: string,
  refreshToken: string,
) {
  const cookieOptions = getCookieOptions(config);

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response, config: ConfigService) {
  const opts = getCookieOptions(config);
  res.clearCookie(ACCESS_TOKEN_COOKIE, opts);
  res.clearCookie(REFRESH_TOKEN_COOKIE, opts);
}
