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
import { TelegrafModule } from 'nestjs-telegraf';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SettingsModule } from 'src/settings';
import { MonitorModule } from 'src/monitor';
import { NearAiModule } from 'src/nearai';
import { NearModule } from 'src/near';
import { BotModule } from 'src/bot';

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
    SettingsModule,
    MonitorModule,
    NearAiModule,
    NearModule,
    BotModule,
    TypeOrmModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST'),
        port: config.get<number>('POSTGRES_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        schema: config.get<string>('POSTGRES_SCHEMA'),
        entities: ['dist/**/*.entity.js'],
        synchronize: false, // ToDo
      }),
    }),
    TelegrafModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('TELEGRAM_BOT_TOKEN')!,
      }),
    }),
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
