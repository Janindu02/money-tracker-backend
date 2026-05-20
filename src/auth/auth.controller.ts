import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../types/auth.types';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { SessionMeta } from './types/session-meta.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  private sessionMeta(req: Request): SessionMeta {
    return {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    };
  }

  @Public()
  @Get('providers')
  @ApiOperation({ summary: 'Available sign-in methods' })
  providers() {
    return this.authService.getAuthProviders();
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.register(dto, res, this.sessionMeta(req));
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res, this.sessionMeta(req));
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and clear cookies' })
  logout(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.authService.getRefreshTokenFromRequest(
      req.cookies as Record<string, string>,
    );
    return this.authService.logout(user.sub, res, refreshToken);
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.authService.getRefreshTokenFromRequest(
      req.cookies as Record<string, string>,
    );
    return this.authService.refresh(refreshToken!, res);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Get('verify-email')
  verifyEmail(@Req() req: Request) {
    const token = req.query.token as string;
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirect to Google OAuth' })
  googleAuth() {
    // Passport redirects to Google; this handler is not reached on success.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = this.config.get<string>('frontendUrl') ?? 'http://localhost:3000';
    const user = req.user as Parameters<AuthService['googleLogin']>[0] | undefined;

    if (!user) {
      res.redirect(`${frontendUrl}/login?error=oauth`);
      return;
    }

    void this.authService
      .googleLogin(user, res, this.sessionMeta(req))
      .then(() => res.redirect(`${frontendUrl}/auth/callback?success=1`))
      .catch(() => res.redirect(`${frontendUrl}/login?error=oauth`));
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
