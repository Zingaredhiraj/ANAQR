import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Suppress debug noise in production; keep structured logs only
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const apiPort = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : configService.get<number>('API_PORT', 4000);
  const rawCors = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  const corsOrigins = rawCors
    .split(',')
    .map((o) => o.trim());

  // ── Security ──────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      // Explicit CSP: allow model-viewer CDN and self-hosted assets
      contentSecurityPolicy: process.env.NODE_ENV === 'production'
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", 'https://ajax.googleapis.com'],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
              connectSrc: ["'self'", ...corsOrigins],
              workerSrc: ["'self'", 'blob:'],
              objectSrc: ["'none'"],
              frameSrc: ["'none'"],
            },
          }
        : false,
    }),
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, Swagger)
      if (!origin) return callback(null, true);
      if (
        corsOrigins.includes('*') ||
        corsOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app')
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.use(cookieParser());

  // ── Global prefix & versioning ────────────────────────────────────
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ── Global pipes & filters ────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      // Prevent prototype pollution via nested object injection
      stopAtFirstError: false,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Graceful shutdown ─────────────────────────────────────────────
  app.enableShutdownHooks();

  // ── Swagger ───────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AnatoScan AR API')
    .setDescription(
      'Complete REST API for AnatoScan AR – Anatomy Learning & Management Platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .addTag('auth', 'Authentication & Authorization')
    .addTag('organs', 'Organ Management')
    .addTag('anatomy-systems', 'Anatomical Systems')
    .addTag('qr-codes', 'QR Code Generation & Management')
    .addTag('models', '3D Model Management')
    .addTag('learning-modules', 'Educational Modules')
    .addTag('quizzes', 'Quiz & Assessment')
    .addTag('feedback', 'Feedback')
    .addTag('analytics', 'Analytics & Reporting')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(apiPort, '0.0.0.0');
  console.log(`\n🚀 AnatoScan AR API running on http://0.0.0.0:${apiPort}/api/v1`);
  console.log(`📚 Swagger docs: http://0.0.0.0:${apiPort}/api/docs\n`);
}

bootstrap();
