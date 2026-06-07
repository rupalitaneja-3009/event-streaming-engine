import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebsocketDeliveryService } from './websocket.delivery';
import { WebhookDeliveryService } from './webhook.delivery';
import { EmailDeliveryService } from './email.delivery';
import { SmsDeliveryService } from './sms/sms.delivery';
import { Msg91Provider } from './sms/msg91.provider';
import { Fast2SmsProvider } from './sms/fast2sms.provider';

@Module({
  imports: [HttpModule],
  providers: [
    WebsocketDeliveryService,
    WebhookDeliveryService,
    EmailDeliveryService,
    SmsDeliveryService,
    Msg91Provider,
    Fast2SmsProvider,
  ],
  exports: [
    WebsocketDeliveryService,
    WebhookDeliveryService,
    EmailDeliveryService,
    SmsDeliveryService,
  ],
})
export class DeliveryModule {}
