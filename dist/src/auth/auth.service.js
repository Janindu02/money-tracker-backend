"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const hash_util_1 = require("../utils/hash.util");
const cookie_util_1 = require("../utils/cookie.util");
const cookie_util_2 = require("../utils/cookie.util");
const login_attempt_service_1 = require("./services/login-attempt.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwt;
    config;
    loginAttempts;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwt, config, loginAttempts) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.loginAttempts = loginAttempts;
    }
    isGoogleEnabled() {
        const clientId = this.config.get('google.clientId')?.trim();
        const clientSecret = this.config.get('google.clientSecret')?.trim();
        if (!clientId || !clientSecret)
            return false;
        const placeholders = ['your-id', 'your-secret', 'not-configured', 'changeme'];
        const idLower = clientId.toLowerCase();
        const secretLower = clientSecret.toLowerCase();
        if (placeholders.some((p) => idLower.includes(p) || secretLower.includes(p)))
            return false;
        return true;
    }
    getAuthProviders() {
        return {
            emailPassword: true,
            google: this.isGoogleEnabled(),
        };
    }
    async register(dto, res, meta) {
        const email = dto.email.trim().toLowerCase();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const verifyToken = (0, hash_util_1.generateToken)();
        const passwordHash = await (0, hash_util_1.hashPassword)(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                passwordHash,
                emailVerifyToken: verifyToken,
            },
        });
        this.logger.log(`Verification email would be sent to ${user.email} with token ${verifyToken}`);
        return this.issueTokens(user.id, user.email, user.role, res, meta);
    }
    async login(dto, res, meta) {
        const email = dto.email.trim().toLowerCase();
        if (this.loginAttempts.isLocked(email)) {
            const minutes = this.loginAttempts.getLockMinutesRemaining(email);
            throw new common_1.UnauthorizedException(`Too many failed login attempts. Try again in ${minutes} minute(s).`);
        }
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            this.loginAttempts.recordFailure(email);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.passwordHash) {
            if (user.googleId) {
                throw new common_1.UnauthorizedException('This account uses Google sign-in. Please continue with Google.');
            }
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await (0, hash_util_1.comparePassword)(dto.password, user.passwordHash);
        if (!valid) {
            this.loginAttempts.recordFailure(email);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.loginAttempts.reset(email);
        return this.issueTokens(user.id, user.email, user.role, res, meta);
    }
    async logout(userId, res, refreshToken) {
        if (refreshToken) {
            await this.prisma.session.deleteMany({ where: { refreshToken } }).catch(() => null);
        }
        else {
            await this.prisma.session.deleteMany({ where: { userId } });
        }
        (0, cookie_util_1.clearAuthCookies)(res, this.config);
        return { message: 'Logged out successfully' };
    }
    async refresh(refreshToken, res) {
        if (!refreshToken)
            throw new common_1.UnauthorizedException('No refresh token');
        const session = await this.prisma.session.findUnique({
            where: { refreshToken },
            include: { user: true },
        });
        if (!session || session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        try {
            this.jwt.verify(refreshToken, {
                secret: this.config.get('jwt.refreshSecret'),
            });
        }
        catch {
            await this.prisma.session.delete({ where: { id: session.id } });
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        await this.prisma.session.delete({ where: { id: session.id } });
        return this.issueTokens(session.user.id, session.user.email, session.user.role, res);
    }
    async pruneOldSessions(userId) {
        const maxSessions = this.config.get('auth.maxSessionsPerUser', 10);
        const sessions = await this.prisma.session.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
        });
        if (sessions.length >= maxSessions) {
            const excess = sessions.slice(maxSessions - 1).map((s) => s.id);
            await this.prisma.session.deleteMany({ where: { id: { in: excess } } });
        }
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            return { message: 'If the email exists, a reset link has been sent' };
        const token = (0, hash_util_1.generateToken)();
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: new Date(Date.now() + 3600000),
            },
        });
        this.logger.log(`Password reset link for ${user.email}: token=${token}`);
        return { message: 'If the email exists, a reset link has been sent' };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: dto.token,
                resetPasswordExpires: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired reset token');
        const passwordHash = await (0, hash_util_1.hashPassword)(dto.password);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });
        return { message: 'Password reset successfully' };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: { emailVerifyToken: token },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid verification token');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, emailVerifyToken: null },
        });
        return { message: 'Email verified successfully' };
    }
    async googleLogin(profile, res, meta) {
        if (!profile.email)
            throw new common_1.BadRequestException('Google account has no email');
        const email = profile.email.trim().toLowerCase();
        let user = await this.prisma.user.findFirst({
            where: { OR: [{ googleId: profile.googleId }, { email }] },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    googleId: profile.googleId,
                    email,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    avatar: profile.avatar,
                    emailVerified: true,
                },
            });
        }
        else if (!user.googleId) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: profile.googleId,
                    avatar: profile.avatar ?? user.avatar,
                    emailVerified: true,
                },
            });
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    avatar: profile.avatar ?? user.avatar,
                    firstName: profile.firstName || user.firstName,
                    lastName: profile.lastName ?? user.lastName,
                },
            });
        }
        this.loginAttempts.reset(profile.email);
        return this.issueTokens(user.id, user.email, user.role, res, meta);
    }
    async issueTokens(userId, email, role, res, meta) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwt.sign(payload, {
            secret: this.config.getOrThrow('jwt.secret'),
            expiresIn: (this.config.get('jwt.accessExpiresIn') ?? '15m'),
        });
        const refreshToken = this.jwt.sign(payload, {
            secret: this.config.getOrThrow('jwt.refreshSecret'),
            expiresIn: (this.config.get('jwt.refreshExpiresIn') ?? '7d'),
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.pruneOldSessions(userId);
        await this.prisma.session.create({
            data: {
                userId,
                refreshToken,
                expiresAt,
                userAgent: meta?.userAgent?.slice(0, 512),
                ipAddress: meta?.ipAddress?.slice(0, 64),
            },
        });
        (0, cookie_util_1.setAuthCookies)(res, this.config, accessToken, refreshToken);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                plan: true,
                role: true,
                currency: true,
                darkMode: true,
                emailVerified: true,
                googleId: true,
                passwordHash: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                plan: user.plan,
                role: user.role,
                currency: user.currency,
                darkMode: user.darkMode,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                authProvider: this.resolveAuthProvider(user.googleId, user.passwordHash),
                hasGoogleLinked: Boolean(user.googleId),
                hasPassword: Boolean(user.passwordHash),
            },
            accessToken,
        };
    }
    resolveAuthProvider(googleId, passwordHash) {
        if (googleId && passwordHash)
            return 'both';
        if (googleId)
            return 'google';
        return 'email';
    }
    getRefreshTokenFromRequest(cookies) {
        return cookies[cookie_util_2.REFRESH_TOKEN_COOKIE];
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        login_attempt_service_1.LoginAttemptService])
], AuthService);
//# sourceMappingURL=auth.service.js.map