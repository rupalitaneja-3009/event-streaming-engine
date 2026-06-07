import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';
import { EventRouterService, IncomingEventMessage } from './event-router.service';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly eventRouter: EventRouterService,
  ) {
    this.kafka = new Kafka({
      clientId: `${this.config.get('KAFKA_CLIENT_ID', 'event-consumer')}-consumer`,
      brokers: this.config.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
      retry: { retries: 10, initialRetryTime: 3000 },
    });
    this.consumer = this.kafka.consumer({
      groupId: this.config.get('KAFKA_GROUP_ID', 'event-consumer-group'),
    });
  }

  async onModuleInit() {
    const topic = this.config.get('KAFKA_TOPIC_NOTIFICATIONS', 'notifications');
    await this.consumer.connect();
    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        try {
          const event: IncomingEventMessage = JSON.parse(message.value.toString());
          await this.eventRouter.process(event);
        } catch (error) {
          this.logger.error(
            `Failed to process message: ${error instanceof Error ? error.message : error}`,
          );
        }
      },
    });

    this.logger.log(`Kafka consumer subscribed to topic: ${topic}`);
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
