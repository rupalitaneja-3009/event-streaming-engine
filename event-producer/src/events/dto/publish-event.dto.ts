import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

const CHANNELS = ['websocket', 'email', 'webhook', 'sms'] as const;
const PRIORITIES = ['low', 'normal', 'high'] as const;

export class EventRecipientsDto {
  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://myapp.com/webhook' })
  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

export class PublishEventDto {
  @ApiProperty({ example: 'order.placed' })
  @IsString()
  topic: string;

  @ApiProperty({ example: 'user_123' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: CHANNELS, isArray: true, example: ['websocket', 'sms'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(CHANNELS, { each: true })
  channels: (typeof CHANNELS)[number][];

  @ApiProperty({ example: { orderId: 'ORD_456', amount: 1299, status: 'confirmed' } })
  @IsObject()
  payload: Record<string, unknown>;

  @ApiPropertyOptional({ type: EventRecipientsDto })
  @IsOptional()
  recipients?: EventRecipientsDto;

  @ApiPropertyOptional({ example: 'order_confirmed' })
  @IsOptional()
  @IsString()
  smsTemplate?: string;

  @ApiPropertyOptional({ enum: PRIORITIES, default: 'normal' })
  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: (typeof PRIORITIES)[number];
}
