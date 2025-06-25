import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'jsonb' })
  message!: StoredAigencyMessageData;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'session_id' })
  sessionId!: string;

  @Column({ name: 'datetime', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  toDto() {
    return {
      id: this.id,
      message: this.message,
      userId: this.userId,
      sessionId: this.sessionId,
      createdAt: this.createdAt,
    };
  }
}

export interface StoredAigencyMessageData {
  name: string | undefined;
  role: string | undefined;
  content: string;
  additional_kwargs?: Record<string, unknown>;
  type: string;
  tool_call_id: string | undefined;
}
