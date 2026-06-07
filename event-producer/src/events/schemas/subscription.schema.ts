import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true, collection: 'subscriptions' })
export class Subscription {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ type: [String], required: true })
  topics: string[];

  @Prop()
  webhookUrl?: string;

  @Prop()
  webhookSecret?: string;

  @Prop({ type: [String], default: ['websocket'] })
  channels: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
