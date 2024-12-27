export type CreateOrderDto = {
  jobs: CreateJobDto[]
}

export type CreateJobDto = {
  schedule: string
  steps: CreateStepDto[]
}

export type CreateStepDto = {
  parserId: string
  url: string
}
