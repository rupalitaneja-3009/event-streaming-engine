import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true, collection: 'events' })
export class Event {
  @Prop({ required: true, unique: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  topic: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, unknown>;

  @Prop({ type: [String], required: true })
  channels: string[];

  @Prop({
    required: true,
    enum: ['PUBLISHED', 'PROCESSING', 'DELIVERED', 'RETRYING', 'FAILED'],
    default: 'PUBLISHED',
  })
  status: string;

  @Prop({ enum: ['low', 'normal', 'high'], default: 'normal' })
  priority: string;

  @Prop({ default: 0 })
  attempts: number;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  failureReason?: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
