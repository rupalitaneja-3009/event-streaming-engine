import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsumerService } from './consumer.service';
import { DlqService } from './dlq.service';
import { EventRouterService } from './event-router.service';
import { DeliveryModule } from '../delivery/delivery.module';
import { Event, EventSchema } from '../schemas/event.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';
import { Subscription, SubscriptionSchema } from '../schemas/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    DeliveryModule,
  ],
  providers: [ConsumerService, DlqService, EventRouterService],
})
export class ConsumerModule {}
