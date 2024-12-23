const apiUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:3001'

export type ContextDto = {
  namespace: string
  contextType: string
  id: string | null
  parsedContext: any
  children?: ContextDto[]
  parentNode?: ContextDto | null
}

export function getGraph() {
  return fetch(`${apiUrl}/context`).then((res) => res.json())
}

export function getContext(
  hash: string
): Promise<{ context: ContextDto | null; status: 'paid' | 'unpaid' }> {
  return fetch(`${apiUrl}/context/${encodeURIComponent(hash)}`).then((res) => res.json())
}

export interface CreateStepDto {
  parserId: string
  url: string
}

export interface CreateJobDto {
  schedule: string // cron expression
  steps: CreateStepDto[]
}

export interface CreateOrderDto {
  jobs: CreateJobDto[]
}

export interface OrderDto {
  id: string
  jobs: CreateJobDto[]
}

export const createOrder = async (orderData: CreateOrderDto) => {
  return fetch(`${apiUrl}/order`, {
    method: 'POST',
    body: JSON.stringify(orderData),
    headers: {
      'Content-Type': 'application/json',
    }
  }).then((res) => res.json())
}

export const getOrders = async (): Promise<OrderDto[]> => {
  return fetch(`${apiUrl}/order`).then((res) => res.json())
}
