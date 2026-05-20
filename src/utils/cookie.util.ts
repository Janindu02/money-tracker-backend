import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export function setAuthCookies(
  res: Response,
  config: ConfigService,
  accessToken: string,
  refreshToken: string,
) {
  const secure = config.get<boolean>('cookie.secure', false);
  const domain = config.get<string | undefined>('cookie.domain');
  const cookieOptions = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    ...(domain ? { domain } : {}),
  };

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
  const secure = config.get<boolean>('cookie.secure', false);
  const domain = config.get<string | undefined>('cookie.domain');
  const opts = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    ...(domain ? { domain } : {}),
  };
  res.clearCookie(ACCESS_TOKEN_COOKIE, opts);
  res.clearCookie(REFRESH_TOKEN_COOKIE, opts);
}
