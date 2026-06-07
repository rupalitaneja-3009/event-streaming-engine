import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async summarize(_userId: string) {
    throw new NotImplementedException('AI summarizer will be implemented in Week 2');
  }
}
