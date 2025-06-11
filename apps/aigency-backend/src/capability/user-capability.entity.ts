import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Capability } from './capability.entity';

@Entity({ name: 'user_capability' })
@Index(['username', 'capabilityId'], { unique: true })
export class UserCapability {
  @PrimaryColumn()
  username: string;

  @PrimaryColumn({ type: 'uuid', name: 'capability_id' })
  capabilityId: string;

  @Column({ default: true, name: 'is_enabled' })
  isEnabled: boolean;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @ManyToOne(() => Capability, (capability) => capability.users)
  @JoinColumn({ name: 'capability_id' })
  capability: Capability;
}
