import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearModule } from 'src/near';
import { NearAiModule } from 'src/nearai';
import { UserModule } from 'src/user';
import { UserRepository } from 'src/user/user.repository'; // ToDo: should be exported from src/user ?
import { CapabilityController } from './capability.controller';
import { Capability } from './capability.entity';
import { CapabilityRepository } from './capability.repository';
import { CapabilityService } from './capability.service';
import { UserCapability } from './user-capability.entity';
import { UserCapabilityRepository } from './user-capability.repository';

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
    UserRepository,
    CapabilityService,
  ],
  controllers: [CapabilityController],
  exports: [CapabilityService],
})
export class CapabilityModule {}
