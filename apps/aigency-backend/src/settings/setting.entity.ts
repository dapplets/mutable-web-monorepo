import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ schema: 'environment', name: 'variables' })
export class Setting {
  @PrimaryColumn({ type: 'varchar', name: 'type' })
  key!: string;

  @Column({ type: 'varchar', nullable: true })
  value!: string | null;

  @Column({ type: 'varchar', name: 'default', nullable: true })
  defaultValue!: string | null;

  toDto() {
    return {
      key: this.key,
      value: this.value,
      default: this.defaultValue,
    };
  }
}
