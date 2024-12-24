export type GetOrderDto = {
  id: string
  jobs: GetJobDto[]
}

export type GetJobDto = {
  id: string
  schedule: string // cron expression
  steps: GetStepDto[]
}

export type GetStepDto = {
  id: string
  parserId: string
  url: string
}
