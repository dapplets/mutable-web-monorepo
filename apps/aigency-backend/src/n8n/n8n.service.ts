import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class N8NService {
  constructor(private configService: ConfigService) {}

  async callMainWorkflow(params: any): Promise<any> {
    const n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL')!;
    const url = new URL('/webhook-test/main', n8nWebhookUrl);

    // ToDo: auth

    const response = await fetch(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return response.json();
  }
}
