import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
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

  // Required for Google OAuth `state` CSRF parameter (passport-google-oauth20)
  app.use(
    session({
      secret: config.get<string>('auth.sessionSecret') ?? config.getOrThrow<string>('jwt.secret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.get<boolean>('cookie.secure', false),
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        sameSite: 'lax',
      },
    }),
  );

  const frontendUrl = config.get<string>('frontendUrl') ?? 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api/v1');

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

  const port = config.get<number>('port') ?? 3001;
  await app.listen(port);
  logger.log(`Finova API running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`, 'Bootstrap');
}

void bootstrap();
