import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class WebhookDeliveryService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async deliver(
    webhookUrl: string,
    payload: Record<string, unknown>,
    secret?: string,
  ) {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Event-Id': String(payload.eventId ?? ''),
    };

    if (secret) {
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
      headers['X-Signature'] = signature;
    }

    const timeout = Number(this.config.get('WEBHOOK_TIMEOUT_MS', 5000));

    const response = await firstValueFrom(
      this.http.post(webhookUrl, payload, {
        headers,
        timeout,
        validateStatus: (status) => status >= 200 && status < 300,
      }),
    );

    return response.data;
  }
}
