import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapabilityModule } from '../capability';
import { SubscriptionModule } from '../subscription';
import { EnvironmentModule } from '../env';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user';
import { WarningModule } from '../warning';
import { MemoryModule } from '../memory';
import { UsageModule } from '../usage';
import { RewardModule } from '../reward';

@Module({
  imports: [
    EnvironmentModule,
    CapabilityModule,
    SubscriptionModule,
    UserModule,
    WarningModule,
    MemoryModule,
    UsageModule,
    RewardModule,
    TypeOrmModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        schema: config.get<string>('DB_SCHEMA'),
        entities: ['dist/**/*.entity.js'],
        synchronize: false, // ToDo
      }),
    }),
  ],
})
export class AppModule {}
