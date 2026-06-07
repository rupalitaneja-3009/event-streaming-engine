import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'AI-powered summary of unread notifications' })
  summary(@Query('userId') userId: string) {
    return this.notificationsService.summarize(userId);
  }
}
