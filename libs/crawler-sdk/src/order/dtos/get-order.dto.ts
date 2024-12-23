export type GetOrderDto = {
  id: string
  jobs: GetJobDto[]
}

export type GetJobDto = {
  id: string
  schedule: string
  steps: GetStepDto[]
}

export type GetStepDto = {
  id: string
  parserId: string
  url: string
}
