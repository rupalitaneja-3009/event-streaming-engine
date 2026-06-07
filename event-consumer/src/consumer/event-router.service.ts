import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { WebsocketDeliveryService } from '../delivery/websocket.delivery';
import { WebhookDeliveryService } from '../delivery/webhook.delivery';
import { EmailDeliveryService } from '../delivery/email.delivery';
import { SmsDeliveryService } from '../delivery/sms/sms.delivery';
import { SmsTemplateName } from '../delivery/sms/sms-templates';
import { DlqService } from './dlq.service';

export interface IncomingEventMessage {
  eventId: string;
  topic: string;
  userId: string;
  channels: string[];
  payload: Record<string, unknown>;
  recipients?: {
    phone?: string;
    email?: string;
    webhookUrl?: string;
  };
  smsTemplate?: string;
  priority?: string;
  publishedAt: string;
}

@Injectable()
export class EventRouterService {
  private readonly logger = new Logger(EventRouterService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    private readonly websocketDelivery: WebsocketDeliveryService,
    private readonly webhookDelivery: WebhookDeliveryService,
    private readonly emailDelivery: EmailDeliveryService,
    private readonly smsDelivery: SmsDeliveryService,
    private readonly dlqService: DlqService,
    private readonly config: ConfigService,
  ) {}

  async process(message: IncomingEventMessage) {
    this.logger.log(`Processing event ${message.eventId} for user ${message.userId}`);

    await this.eventModel.findOneAndUpdate(
      { eventId: message.eventId },
      { status: 'PROCESSING' },
    );

    const subscription = await this.subscriptionModel.findOne({
      userId: message.userId,
      isActive: true,
    });

    const results: { channel: string; success: boolean; error?: string }[] = [];

    for (const channel of message.channels) {
      const result = await this.deliverChannel(message, channel, subscription);
      results.push(result);
    }

    const allSucceeded = results.every((r) => r.success);
    const allFailed = results.every((r) => !r.success);

    if (allSucceeded) {
      await this.eventModel.findOneAndUpdate(
        { eventId: message.eventId },
        { status: 'DELIVERED', deliveredAt: new Date() },
      );
      this.logger.log(`Event ${message.eventId} DELIVERED on all channels`);
    } else if (allFailed) {
      await this.eventModel.findOneAndUpdate(
        { eventId: message.eventId },
        {
          status: 'FAILED',
          failureReason: results.map((r) => `${r.channel}: ${r.error}`).join('; '),
        },
      );
      await this.dlqService.sendToDlq(message, results);
      this.logger.error(`Event ${message.eventId} FAILED on all channels`);
    } else {
      await this.eventModel.findOneAndUpdate(
        { eventId: message.eventId },
        {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          failureReason: `Partial: ${results
            .filter((r) => !r.success)
            .map((r) => r.channel)
            .join(', ')} failed`,
        },
      );
      this.logger.warn(`Event ${message.eventId} partially delivered`);
    }
  }

  private async deliverChannel(
    message: IncomingEventMessage,
    channel: string,
    subscription: SubscriptionDocument | null,
  ): Promise<{ channel: string; success: boolean; error?: string }> {
    const maxRetries = Number(this.config.get('DELIVERY_MAX_RETRIES', 3));
    const baseDelay = Number(this.config.get('DELIVERY_RETRY_BASE_DELAY_MS', 2000));

    const notification = await this.notificationModel.create({
      eventId: message.eventId,
      userId: message.userId,
      channel,
      status: 'PENDING',
      attempts: 0,
    });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.executeDelivery(message, channel, subscription);

        await this.notificationModel.findByIdAndUpdate(notification._id, {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          attempts: attempt,
        });

        return { channel, success: true };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Channel ${channel} attempt ${attempt}/${maxRetries} failed: ${errMsg}`,
        );

        await this.eventModel.findOneAndUpdate(
          { eventId: message.eventId },
          { status: 'RETRYING', attempts: attempt },
        );

        if (attempt < maxRetries) {
          await this.sleep(baseDelay * Math.pow(2, attempt - 1));
        } else {
          await this.notificationModel.findByIdAndUpdate(notification._id, {
            status: 'FAILED',
            error: errMsg,
            attempts: attempt,
          });
          return { channel, success: false, error: errMsg };
        }
      }
    }

    return { channel, success: false, error: 'Unknown error' };
  }

  private async executeDelivery(
    message: IncomingEventMessage,
    channel: string,
    subscription: SubscriptionDocument | null,
  ) {
    const notificationPayload = {
      eventId: message.eventId,
      topic: message.topic,
      userId: message.userId,
      payload: message.payload,
      priority: message.priority,
      timestamp: new Date().toISOString(),
    };

    switch (channel) {
      case 'websocket':
        await this.websocketDelivery.deliver(message.userId, notificationPayload);
        break;

      case 'webhook': {
        const webhookUrl =
          message.recipients?.webhookUrl ?? subscription?.webhookUrl;
        if (!webhookUrl) {
          throw new Error('No webhook URL configured');
        }
        const secret = subscription?.webhookSecret;
        await this.webhookDelivery.deliver(webhookUrl, notificationPayload, secret);
        break;
      }

      case 'email': {
        const email = message.recipients?.email;
        if (!email) {
          throw new Error('No email address provided');
        }
        await this.emailDelivery.deliver(email, message.topic, notificationPayload);
        break;
      }

      case 'sms': {
        const phone = message.recipients?.phone;
        if (!phone) {
          throw new Error('No phone number provided');
        }
        const template = (message.smsTemplate ?? 'order_confirmed') as SmsTemplateName;
        await this.smsDelivery.deliver(phone, template, message.payload);
        break;
      }

      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
