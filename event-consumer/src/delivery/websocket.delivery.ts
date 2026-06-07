import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebsocketDeliveryService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async deliver(userId: string, payload: Record<string, unknown>) {
    const gatewayUrl = this.config.get('NOTIFICATION_GATEWAY_URL', 'http://localhost:3012');

    const response = await firstValueFrom(
      this.http.post(`${gatewayUrl}/internal/push`, { userId, payload }),
    );

    return response.data;
  }
}
