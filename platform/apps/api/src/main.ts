import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v2');
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' });
  await app.listen(process.env.PORT || 4000);
  console.log(`NestJS API: http://localhost:${process.env.PORT || 4000}/api/v2`);
}
bootstrap();
