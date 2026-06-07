import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Msg91Provider {
  private readonly logger = new Logger(Msg91Provider.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async send(phone: string, message: string) {
    const devMode = this.config.get('SMS_DEV_MODE', 'true') === 'true';
    const apiKey = this.config.get<string>('MSG91_API_KEY');

    if (devMode || !apiKey) {
      this.logger.log(`[SMS DEV] To: ${phone} | Message: ${message}`);
      return { success: true, mode: 'dev' };
    }

    const senderId = this.config.get('MSG91_SENDER_ID', 'NOTIFY');
    const route = this.config.get('MSG91_ROUTE', '4');

    const response = await firstValueFrom(
      this.http.post(
        'https://control.msg91.com/api/v5/flow/',
        {
          template_id: '',
          short_url: '0',
          recipients: [{ mobiles: phone.replace('+', ''), var: message }],
        },
        {
          headers: {
            authkey: apiKey,
            'Content-Type': 'application/json',
          },
          params: { sender: senderId, route },
        },
      ),
    );

    return { success: true, mode: 'msg91', data: response.data };
  }
}
