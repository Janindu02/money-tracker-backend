import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('google.clientId')?.trim() || 'not-configured',
      clientSecret: config.get<string>('google.clientSecret')?.trim() || 'not-configured',
      callbackURL:
        config.get<string>('google.callbackUrl') ??
        'http://localhost:3001/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
      state: true,
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, emails, photos, id } = profile;
    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName ?? 'User',
      lastName: name?.familyName ?? '',
      avatar: photos?.[0]?.value,
    };
    done(null, user);
  }
}
