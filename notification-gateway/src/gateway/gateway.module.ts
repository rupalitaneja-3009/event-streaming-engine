import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { GatewayService } from './gateway.service';
import { InternalController } from './internal.controller';

@Module({
  providers: [NotificationGateway, GatewayService],
  controllers: [InternalController],
  exports: [GatewayService, NotificationGateway],
})
export class GatewayModule {}
