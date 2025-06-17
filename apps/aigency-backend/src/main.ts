import { NestFactory } from '@nestjs/core';
import { AppModule } from './app';
import { JsonRpcServer } from '@dapplets/openrpc-nestjs-json-rpc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.connectMicroservice({
    strategy: new JsonRpcServer({
      path: '/rpc',
      adapter: app.getHttpAdapter(),
    }),
  });

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
