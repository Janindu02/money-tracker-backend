import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare const ACCESS_TOKEN_COOKIE = "access_token";
export declare const REFRESH_TOKEN_COOKIE = "refresh_token";
export declare function setAuthCookies(res: Response, config: ConfigService, accessToken: string, refreshToken: string): void;
export declare function clearAuthCookies(res: Response, config: ConfigService): void;
