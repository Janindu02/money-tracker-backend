import { resolveDatabaseUrl, syncDatabaseUrlEnv } from './database-url';

export default () => {
  const databaseUrl = syncDatabaseUrlEnv();

  return {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  databaseUrl: databaseUrl || resolveDatabaseUrl(),
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ??
      'http://localhost:3001/api/v1/auth/google/callback',
  },
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
  auth: {
    maxSessionsPerUser: parseInt(process.env.MAX_SESSIONS_PER_USER ?? '10', 10),
    sessionSecret: process.env.SESSION_SECRET ?? process.env.JWT_SECRET,
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
};
};
