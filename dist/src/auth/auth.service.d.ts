import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginAttemptService } from './services/login-attempt.service';
import type { SessionMeta } from './types/session-meta.types';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private loginAttempts;
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, loginAttempts: LoginAttemptService);
    isGoogleEnabled(): boolean;
    getAuthProviders(): {
        emailPassword: boolean;
        google: boolean;
    };
    register(dto: RegisterDto, res: Response, meta?: SessionMeta): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
            plan: string;
            role: import("@prisma/client").$Enums.Role;
            currency: string;
            darkMode: boolean;
            emailVerified: boolean;
            createdAt: Date;
            authProvider: "email" | "google" | "both";
            hasGoogleLinked: boolean;
            hasPassword: boolean;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto, res: Response, meta?: SessionMeta): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
            plan: string;
            role: import("@prisma/client").$Enums.Role;
            currency: string;
            darkMode: boolean;
            emailVerified: boolean;
            createdAt: Date;
            authProvider: "email" | "google" | "both";
            hasGoogleLinked: boolean;
            hasPassword: boolean;
        };
        accessToken: string;
    }>;
    logout(userId: string, res: Response, refreshToken?: string): Promise<{
        message: string;
    }>;
    refresh(refreshToken: string, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
            plan: string;
            role: import("@prisma/client").$Enums.Role;
            currency: string;
            darkMode: boolean;
            emailVerified: boolean;
            createdAt: Date;
            authProvider: "email" | "google" | "both";
            hasGoogleLinked: boolean;
            hasPassword: boolean;
        };
        accessToken: string;
    }>;
    private pruneOldSessions;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    googleLogin(profile: {
        googleId: string;
        email?: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    }, res: Response, meta?: SessionMeta): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
            plan: string;
            role: import("@prisma/client").$Enums.Role;
            currency: string;
            darkMode: boolean;
            emailVerified: boolean;
            createdAt: Date;
            authProvider: "email" | "google" | "both";
            hasGoogleLinked: boolean;
            hasPassword: boolean;
        };
        accessToken: string;
    }>;
    private issueTokens;
    resolveAuthProvider(googleId: string | null, passwordHash: string | null): 'google' | 'email' | 'both';
    getRefreshTokenFromRequest(cookies: Record<string, string>): string | undefined;
}
