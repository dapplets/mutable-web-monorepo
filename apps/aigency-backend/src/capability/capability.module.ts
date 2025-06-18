import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capability } from './capability.entity';
import { CapabilityRepository } from './capability.repository';
import { CapabilityService } from './capability.service';
import { CapabilityController } from './capability.controller';
import { UserCapability } from './user-capability.entity';
import { UserCapabilityRepository } from './user-capability.repository';
import { UserModule } from 'src/user';
import { NearAiModule } from 'src/nearai';

@Module({
  imports: [
    TypeOrmModule.forFeature([Capability, UserCapability]),
    UserModule,
    NearAiModule,
  ],
  providers: [
    CapabilityRepository,
    UserCapabilityRepository,
    CapabilityService,
  ],
  controllers: [CapabilityController],
  exports: [CapabilityService],
})
export class CapabilityModule {}
