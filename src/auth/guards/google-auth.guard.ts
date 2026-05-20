import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const clientId = this.config.get<string>('google.clientId')?.trim();
    const clientSecret = this.config.get<string>('google.clientSecret')?.trim();

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured on this server',
      );
    }

    return super.canActivate(context);
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    info: { message?: string } | undefined,
    _context: ExecutionContext,
  ): TUser {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException(
        info?.message ?? 'Google authentication failed',
      );
    }
    return user;
  }
}
