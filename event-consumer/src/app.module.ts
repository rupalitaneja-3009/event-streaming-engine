import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConsumerModule } from './consumer/consumer.module';
import { DeliveryModule } from './delivery/delivery.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/event_streaming'),
      }),
      inject: [ConfigService],
    }),
    HttpModule.register({ timeout: 5000 }),
    ConsumerModule,
    DeliveryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
