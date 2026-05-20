import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { JwtPayload } from '../types/auth.types';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private authService;
    private config;
    constructor(authService: AuthService, config: ConfigService);
    private sessionMeta;
    providers(): {
        emailPassword: boolean;
        google: boolean;
    };
    register(dto: RegisterDto, req: Request, res: Response): Promise<{
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
    login(dto: LoginDto, req: Request, res: Response): Promise<{
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
    logout(user: JwtPayload, req: Request, res: Response): Promise<{
        message: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
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
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(req: Request): Promise<{
        message: string;
    }>;
    googleAuth(): void;
    googleCallback(req: Request, res: Response): void;
    me(user: JwtPayload): JwtPayload;
}
