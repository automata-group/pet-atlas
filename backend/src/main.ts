import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  // 1. Security Headers (XSS, Clickjacking, etc.)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Serve static files from uploads folder
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 2. CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: true, // In production, replace with specific frontend URL
    credentials: true,
  });

  // 3. Cookie Parser for secure auth tokens (CSRF safety)
  app.use(cookieParser());

  // 4. Global Validation (SQL Injection & DTO safety)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that are not in DTO
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-convert types
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
