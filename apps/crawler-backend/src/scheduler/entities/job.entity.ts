import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'jobs',
  schema: 'graphile_worker',
  synchronize: false,
})
export class Job {
  @ViewColumn()
  id: number;

  @ViewColumn()
  queue_name: string;

  @ViewColumn()
  task_identifier: string;

  @ViewColumn()
  priority: number;

  @ViewColumn()
  run_at: Date;

  @ViewColumn()
  attempts: number;

  @ViewColumn()
  max_attempts: number;

  @ViewColumn()
  last_error: string;

  @ViewColumn()
  created_at: Date;

  @ViewColumn()
  updated_at: Date;

  @ViewColumn()
  key: string;

  @ViewColumn()
  locked_at: Date;

  @ViewColumn()
  locked_by: string;

  @ViewColumn()
  revision: number;

  @ViewColumn()
  flags: number;
}
