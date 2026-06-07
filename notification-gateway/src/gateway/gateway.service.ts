import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Server } from 'socket.io';

@Injectable()
export class GatewayService implements OnModuleDestroy {
  private redis: Redis;
  private server: Server | null = null;
  private socketToUser = new Map<string, string>();

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: Number(this.config.get('REDIS_PORT', 6380)),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    this.redis.connect().catch(() => {
      // Redis optional for local dev — in-memory map still works
    });
  }

  setServer(server: Server) {
    this.server = server;
  }

  trackConnection(socketId: string) {
    this.redis.sadd('ws:active_connections', socketId).catch(() => undefined);
  }

  untrackConnection(socketId: string) {
    const userId = this.socketToUser.get(socketId);
    this.redis.srem('ws:active_connections', socketId).catch(() => undefined);
    if (userId) {
      this.redis.srem(`ws:user:${userId}`, socketId).catch(() => undefined);
    }
    this.socketToUser.delete(socketId);
  }

  registerUserRoom(socketId: string, userId: string) {
    this.socketToUser.set(socketId, userId);
    this.redis.sadd(`ws:user:${userId}`, socketId).catch(() => undefined);
  }

  getUserRoom(userId: string) {
    return `user_${userId}`;
  }

  pushNotification(userId: string, payload: Record<string, unknown>) {
    if (!this.server) {
      throw new Error('WebSocket server not initialized');
    }
    const room = this.getUserRoom(userId);
    this.server.to(room).emit('notification', payload);
    return { room, userId };
  }

  async getActiveConnectionCount(): Promise<number> {
    try {
      return await this.redis.scard('ws:active_connections');
    } catch {
      return this.socketToUser.size;
    }
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
