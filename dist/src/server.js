"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = __importDefault(require("helmet"));
const nest_winston_1 = require("nest-winston");
const app_module_1 = require("./app.module");
let cachedServer;
async function createApp() {
    if (cachedServer) {
        return cachedServer;
    }
    const expressApp = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp), { bufferLogs: true });
    const config = app.get(config_1.ConfigService);
    const logger = app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);
    app.set('trust proxy', 1);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, express_session_1.default)({
        secret: config.get('auth.sessionSecret') ?? config.getOrThrow('jwt.secret'),
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: config.get('cookie.secure', false),
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            sameSite: 'lax',
        },
    }));
    const frontendUrl = config.get('frontendUrl') ?? 'http://localhost:3000';
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Finova API')
        .setDescription('Finova money management backend API')
        .setVersion('1.0')
        .addBearerAuth()
        .addCookieAuth('access_token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.init();
    cachedServer = expressApp;
    return expressApp;
}
//# sourceMappingURL=server.js.map