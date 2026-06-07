import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly config: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.config.get<string>('KAFKA_CLIENT_ID', 'event-producer'),
      brokers: this.config.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
      retry: { retries: 10, initialRetryTime: 3000 },
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async send(topic: string, messages: { key?: string; value: string }[]) {
    return this.producer.send({ topic, messages });
  }
}
