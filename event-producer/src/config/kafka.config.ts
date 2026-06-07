import { ConfigService } from '@nestjs/config';

export const getKafkaConfig = (config: ConfigService) => ({
  clientId: config.get<string>('KAFKA_CLIENT_ID', 'event-streaming-engine'),
  brokers: config.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
  topicNotifications: config.get<string>('KAFKA_TOPIC_NOTIFICATIONS', 'notifications'),
});
