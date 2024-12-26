export type ClientConfig = {
  apiUrl: string
}

export class Client {
  constructor(public readonly config: ClientConfig) {}

  get(path: string): Promise<any> {
    return fetch(`${this.config.apiUrl}/${path}`).then((res) => res.json())
  }

  patch(path: string, body: any): Promise<any> {
    return fetch(`${this.config.apiUrl}/${path}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())
  }

  post(path: string, body: any): Promise<any> {
    return fetch(`${this.config.apiUrl}/${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())
  }

  delete(path: string): Promise<any> {
    return fetch(`${this.config.apiUrl}/${path}`, {
      method: 'DELETE',
    }).then((res) => res.json())
  }
}
