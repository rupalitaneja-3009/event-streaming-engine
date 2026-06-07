import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

const CHANNELS = ['websocket', 'email', 'webhook', 'sms'] as const;

export class SubscribeDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: ['order.placed', 'payment.done'], isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  topics: string[];

  @ApiPropertyOptional({ enum: CHANNELS, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(CHANNELS, { each: true })
  channels?: (typeof CHANNELS)[number][];

  @ApiPropertyOptional({ example: 'https://myapp.com/webhook' })
  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @ApiPropertyOptional({ description: 'Plain secret — stored hashed in DB' })
  @IsOptional()
  @IsString()
  webhookSecret?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
