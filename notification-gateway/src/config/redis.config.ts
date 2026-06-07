import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (config: ConfigService) => ({
  host: config.get<string>('REDIS_HOST', 'localhost'),
  port: config.get<number>('REDIS_PORT', 6380),
});
