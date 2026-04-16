import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (Cross-Origin Resource Sharing)
  // This allows your Next.js frontend to talk to this API
  app.enableCors();

  // Set global prefix for all routes (e.g., /api/v1/users)
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  // - whitelist: true (Removes any fields not defined in the DTO)
  // - transform: true (Automatically converts types, e.g., string to number)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  Logger.error('Error starting server: ', error);
  process.exit(1);
});
