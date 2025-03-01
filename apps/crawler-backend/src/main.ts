import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { CRAWLER_API_PORT } from './env';
import { WorkerService } from 'nestjs-graphile-worker';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enables class-transformer
      whitelist: true, // Removes properties that are not part of the DTO
      forbidNonWhitelisted: true, // Throws an error for non-whitelisted properties
    }),
  );
  app.get(WorkerService).run();
  await app.listen(CRAWLER_API_PORT);
}
bootstrap();
