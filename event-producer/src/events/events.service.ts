import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { KafkaProducerService } from '../kafka/kafka.producer';
import { ConfigService } from '@nestjs/config';
import { PublishEventDto } from './dto/publish-event.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { Event, EventDocument } from './schemas/event.schema';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';

export interface EventMessage {
  eventId: string;
  topic: string;
  userId: string;
  channels: string[];
  payload: Record<string, unknown>;
  recipients?: PublishEventDto['recipients'];
  smsTemplate?: string;
  priority: string;
  publishedAt: string;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly config: ConfigService,
  ) {}

  async publish(dto: PublishEventDto) {
    const eventId = `evt_${uuidv4()}`;
    const topic = this.config.get('KAFKA_TOPIC_NOTIFICATIONS', 'notifications');

    const event = await this.eventModel.create({
      eventId,
      topic: dto.topic,
      userId: dto.userId,
      payload: dto.payload,
      channels: dto.channels,
      status: 'PUBLISHED',
      priority: dto.priority ?? 'normal',
      attempts: 0,
    });

    const message: EventMessage = {
      eventId,
      topic: dto.topic,
      userId: dto.userId,
      channels: dto.channels,
      payload: dto.payload,
      recipients: dto.recipients,
      smsTemplate: dto.smsTemplate,
      priority: dto.priority ?? 'normal',
      publishedAt: new Date().toISOString(),
    };

    await this.kafkaProducer.send(topic, [
      {
        key: dto.userId,
        value: JSON.stringify(message),
      },
    ]);

    return {
      eventId: event.eventId,
      status: event.status,
      topic: dto.topic,
      channels: dto.channels,
      message: 'Event published to Kafka',
    };
  }

  async subscribe(dto: SubscribeDto) {
    const subscription = await this.subscriptionModel.findOneAndUpdate(
      { userId: dto.userId },
      {
        userId: dto.userId,
        topics: dto.topics,
        channels: dto.channels ?? ['websocket'],
        webhookUrl: dto.webhookUrl,
        webhookSecret: dto.webhookSecret,
        isActive: dto.isActive ?? true,
      },
      { upsert: true, new: true },
    );

    return {
      userId: subscription.userId,
      topics: subscription.topics,
      channels: subscription.channels,
      webhookUrl: subscription.webhookUrl,
      isActive: subscription.isActive,
      message: 'Subscription saved',
    };
  }

  async getHistory(userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required');
    }

    const events = await this.eventModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return { userId, count: events.length, events };
  }

  async getStats() {
    const [total, published, processing, delivered, failed, retrying] =
      await Promise.all([
        this.eventModel.countDocuments(),
        this.eventModel.countDocuments({ status: 'PUBLISHED' }),
        this.eventModel.countDocuments({ status: 'PROCESSING' }),
        this.eventModel.countDocuments({ status: 'DELIVERED' }),
        this.eventModel.countDocuments({ status: 'FAILED' }),
        this.eventModel.countDocuments({ status: 'RETRYING' }),
      ]);

    return {
      total,
      byStatus: { published, processing, delivered, failed, retrying },
      deliveryRate:
        total > 0 ? `${Math.round((delivered / total) * 100)}%` : '0%',
    };
  }
}
