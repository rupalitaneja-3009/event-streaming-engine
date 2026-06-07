import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Msg91Provider } from './msg91.provider';
import { Fast2SmsProvider } from './fast2sms.provider';
import { SMS_TEMPLATES, SmsTemplateName } from './sms-templates';

@Injectable()
export class SmsDeliveryService {
  constructor(
    private readonly config: ConfigService,
    private readonly msg91: Msg91Provider,
    private readonly fast2sms: Fast2SmsProvider,
  ) {}

  async deliver(phone: string, template: SmsTemplateName, payload: Record<string, unknown>) {
    const message = SMS_TEMPLATES[template](payload);
    const provider = this.config.get('SMS_PROVIDER', 'msg91');

    if (provider === 'fast2sms') {
      return this.fast2sms.send(phone, message);
    }

    return this.msg91.send(phone, message);
  }
}
