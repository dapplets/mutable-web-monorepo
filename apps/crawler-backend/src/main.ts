import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { CRAWLER_API_PORT } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(CRAWLER_API_PORT);
}
bootstrap();
