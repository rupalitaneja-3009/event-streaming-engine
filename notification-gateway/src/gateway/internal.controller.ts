import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import { PushDto } from './dto/push.dto';

@ApiTags('internal')
@Controller('internal')
export class InternalController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('push')
  @ApiOperation({ summary: 'Push notification to a user WebSocket room' })
  push(@Body() body: PushDto) {
    const result = this.gatewayService.pushNotification(body.userId, body.payload);
    return {
      status: 'delivered',
      ...result,
      eventId: body.payload?.eventId,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Active WebSocket connection count' })
  async stats() {
    const activeConnections = await this.gatewayService.getActiveConnectionCount();
    return { activeConnections };
  }
}
