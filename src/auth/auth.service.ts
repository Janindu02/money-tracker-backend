import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { comparePassword, generateToken, hashPassword } from '../utils/hash.util';
import { clearAuthCookies, setAuthCookies } from '../utils/cookie.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { REFRESH_TOKEN_COOKIE } from '../utils/cookie.util';
import { LoginAttemptService } from './services/login-attempt.service';
import type { SessionMeta } from './types/session-meta.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private loginAttempts: LoginAttemptService,
  ) {}

  isGoogleEnabled(): boolean {
    const clientId = this.config.get<string>('google.clientId')?.trim();
    const clientSecret = this.config.get<string>('google.clientSecret')?.trim();
    if (!clientId || !clientSecret) return false;
    const placeholders = ['your-id', 'your-secret', 'not-configured', 'changeme'];
    const idLower = clientId.toLowerCase();
    const secretLower = clientSecret.toLowerCase();
    if (placeholders.some((p) => idLower.includes(p) || secretLower.includes(p))) return false;
    return true;
  }

  getAuthProviders() {
    return {
      emailPassword: true,
      google: this.isGoogleEnabled(),
    };
  }

  async register(dto: RegisterDto, res: Response, meta?: SessionMeta) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const verifyToken = generateToken();
    const passwordHash = await hashPassword(dto.password);

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

  async login(dto: LoginDto, res: Response, meta?: SessionMeta) {
    const email = dto.email.trim().toLowerCase();

    if (this.loginAttempts.isLocked(email)) {
      const minutes = this.loginAttempts.getLockMinutesRemaining(email);
      throw new UnauthorizedException(
        `Too many failed login attempts. Try again in ${minutes} minute(s).`,
      );
    }

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      this.loginAttempts.recordFailure(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      if (user.googleId) {
        throw new UnauthorizedException(
          'This account uses Google sign-in. Please continue with Google.',
        );
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      this.loginAttempts.recordFailure(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.loginAttempts.reset(email);
    return this.issueTokens(user.id, user.email, user.role, res, meta);
  }

  async logout(userId: string, res: Response, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.session.deleteMany({ where: { refreshToken } }).catch(() => null);
    } else {
      await this.prisma.session.deleteMany({ where: { userId } });
    }
    clearAuthCookies(res, this.config);
    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string, res: Response) {
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    try {
      this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.session.delete({ where: { id: session.id } });
    return this.issueTokens(session.user.id, session.user.email, session.user.role, res);
  }

  private async pruneOldSessions(userId: string): Promise<void> {
    const maxSessions = this.config.get<number>('auth.maxSessionsPerUser', 10);
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

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const token = generateToken();
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

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await hashPassword(dto.password);
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

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });
    if (!user) throw new BadRequestException('Invalid verification token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });

    return { message: 'Email verified successfully' };
  }

  async googleLogin(
    profile: {
      googleId: string;
      email?: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    },
    res: Response,
    meta?: SessionMeta,
  ) {
    if (!profile.email) throw new BadRequestException('Google account has no email');

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
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          avatar: profile.avatar ?? user.avatar,
          emailVerified: true,
        },
      });
    } else {
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

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    res: Response,
    meta?: SessionMeta,
  ) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('jwt.secret'),
      expiresIn: (this.config.get<string>('jwt.accessExpiresIn') ?? '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: (this.config.get<string>('jwt.refreshExpiresIn') ?? '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
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

    setAuthCookies(res, this.config, accessToken, refreshToken);

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

    if (!user) throw new UnauthorizedException('User not found');

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

  resolveAuthProvider(googleId: string | null, passwordHash: string | null): 'google' | 'email' | 'both' {
    if (googleId && passwordHash) return 'both';
    if (googleId) return 'google';
    return 'email';
  }

  getRefreshTokenFromRequest(cookies: Record<string, string>): string | undefined {
    return cookies[REFRESH_TOKEN_COOKIE];
  }
}
