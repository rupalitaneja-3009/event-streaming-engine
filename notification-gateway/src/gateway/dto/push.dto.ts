import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class PushDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: { eventId: 'evt_123', topic: 'order.placed' } })
  @IsObject()
  payload: Record<string, unknown>;
}
