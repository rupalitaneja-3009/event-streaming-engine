import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  channel: string;

  @Prop({
    required: true,
    enum: ['PENDING', 'DELIVERED', 'FAILED'],
    default: 'PENDING',
  })
  status: string;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  readAt?: Date;

  @Prop()
  error?: string;

  @Prop({ default: 0 })
  attempts: number;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
