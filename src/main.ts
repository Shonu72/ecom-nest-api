import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Ecom NestJs API')
    .setDescription('The Ecom NestJs API description and documentation.')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Users', 'User management and profile endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name must match @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

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
