import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GatewayService } from './gateway.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly gatewayService: GatewayService) {}

  afterInit() {
    this.gatewayService.setServer(this.server);
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.gatewayService.trackConnection(client.id);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.gatewayService.untrackConnection(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    const room = this.gatewayService.getUserRoom(data.userId);
    client.join(room);
    this.gatewayService.registerUserRoom(client.id, data.userId);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', room, userId: data.userId };
  }

  @SubscribeMessage('ack')
  handleAck(@MessageBody() data: { eventId: string }) {
    this.logger.log(`Ack received for event: ${data.eventId}`);
    return { event: 'acknowledged', eventId: data.eventId };
  }

  pushToUser(userId: string, payload: Record<string, unknown>) {
    const room = this.gatewayService.getUserRoom(userId);
    this.server.to(room).emit('notification', payload);
    return { room, delivered: true };
  }
}
