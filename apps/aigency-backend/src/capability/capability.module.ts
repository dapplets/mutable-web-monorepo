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
import { NearModule } from 'src/near';

@Module({
  imports: [
    TypeOrmModule.forFeature([Capability, UserCapability]),
    UserModule,
    NearAiModule,
    NearModule,
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
