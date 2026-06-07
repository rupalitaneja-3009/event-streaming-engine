import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Fast2SmsProvider {
  private readonly logger = new Logger(Fast2SmsProvider.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async send(phone: string, message: string) {
    const devMode = this.config.get('SMS_DEV_MODE') === 'true';
    const apiKey = this.config.get<string>('FAST2SMS_API_KEY');

    if (devMode || !apiKey) {
      this.logger.log(`[SMS DEV] To: ${phone} | Message: ${message}`);
      return { success: true, mode: 'dev' };
    }

    this.logger.log(`[SMS] Sending to ${phone}`);

    try {
      const cleanPhone = phone
        .replace(/^\+91/, '')
        .replace(/^91/, '')
        .trim();

      const response = await firstValueFrom(
        this.http.get('https://www.fast2sms.com/dev/bulkV2', {
          params: {
            authorization: apiKey,
            message: message,
            language: 'english',
            route: 'q',
            numbers: cleanPhone,
          },
        }),
      );

      this.logger.log(
        `[SMS] Sent successfully to ${phone}: ${JSON.stringify(response.data)}`,
      );
      return { success: true, mode: 'fast2sms', data: response.data };
    } catch (error: any) {
      this.logger.error(
        `[SMS] Failed to send to ${phone}: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`,
      );
      throw error;
    }
  }
}
