import {
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Job, (job) => job.order, { cascade: true })
  jobs: Job[];
}

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  schedule: string; // cron expression

  @OneToMany(() => Step, (step) => step.job, { cascade: true })
  steps: Step[];

  @ManyToOne(() => Order, (order) => order.jobs)
  order: Order;
}

@Entity()
export class Step {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  parserId: string;

  @Column()
  url: string;

  @ManyToOne(() => Job, (job) => job.steps)
  job: Job;
}
