import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum WebhookEvent {
  MessageReceived = 'messageReceived',
  ContextReceived = 'contextReceived',
}

@Injectable()
export class N8NService {
  constructor(private configService: ConfigService) {}

  async callMainWorkflow(
    event: WebhookEvent,
    params: any,
    isTest: boolean,
  ): Promise<any> {
    const n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL')!;

    const url = new URL(
      isTest ? `/webhook-test/aigency` : `/webhook/aigency`,
      n8nWebhookUrl,
    );

    // ToDo: auth

    const response = await fetch(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: event,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        params,
      }),
    });

    return response.json();
  }
}
