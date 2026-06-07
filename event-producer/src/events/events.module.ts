import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event, EventSchema } from './schemas/event.schema';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    KafkaModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
