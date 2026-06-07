import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { IncomingEventMessage } from './event-router.service';

@Injectable()
export class DlqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DlqService.name);
  private producer: Producer;

  constructor(private readonly config: ConfigService) {
    const kafka = new Kafka({
      clientId: `${this.config.get('KAFKA_CLIENT_ID', 'event-consumer')}-dlq`,
      brokers: this.config.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
    });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendToDlq(
    message: IncomingEventMessage,
    failures: { channel: string; success: boolean; error?: string }[],
  ) {
    const topic = this.config.get('KAFKA_TOPIC_DLQ', 'dead-letter-queue');

    await this.producer.send({
      topic,
      messages: [
        {
          key: message.eventId,
          value: JSON.stringify({
            ...message,
            failedAt: new Date().toISOString(),
            failures: failures.filter((f) => !f.success),
          }),
        },
      ],
    });

    this.logger.warn(`Event ${message.eventId} sent to DLQ topic: ${topic}`);
  }
}
