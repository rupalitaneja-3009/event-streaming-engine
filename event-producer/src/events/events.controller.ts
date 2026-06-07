import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { PublishEventDto } from './dto/publish-event.dto';
import { SubscribeDto } from './dto/subscribe.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('publish')
  @ApiOperation({ summary: 'Publish a new event to Kafka' })
  publish(@Body() dto: PublishEventDto) {
    return this.eventsService.publish(dto);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe a user to event topics' })
  subscribe(@Body() dto: SubscribeDto) {
    return this.eventsService.subscribe(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get past events for a user' })
  history(@Query('userId') userId: string) {
    return this.eventsService.getHistory(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard stats — total events, delivered, failed' })
  stats() {
    return this.eventsService.getStats();
  }
}
