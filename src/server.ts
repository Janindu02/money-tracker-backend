import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { getDatabaseHost } from './config/database-url';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { parseCorsOrigins } from './utils/cors.util';

let cachedServer: Express | undefined;

export async function createApp(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    { bufferLogs: true },
  );
  const config = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(cookieParser());

  const cookieSameSite = config.get<'lax' | 'none' | 'strict'>('cookie.sameSite', 'lax');

  app.use(
    session({
      secret: config.get<string>('auth.sessionSecret') ?? config.getOrThrow<string>('jwt.secret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.get<boolean>('cookie.secure', false),
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        sameSite: cookieSameSite,
      },
    }),
  );

  const frontendUrl = config.get<string>('frontendUrl') ?? 'http://localhost:3000';
  const allowedOrigins = parseCorsOrigins(frontendUrl);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: 'favicon.ico', method: RequestMethod.GET },
      { path: 'favicon.png', method: RequestMethod.GET },
    ],
  });

  const databaseUrl = config.getOrThrow<string>('databaseUrl');
  logger.log(`Database host: ${getDatabaseHost(databaseUrl)}`, 'Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Finova API')
    .setDescription('Finova money management backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
  cachedServer = expressApp;
  return expressApp;
}
