import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailDeliveryService {
  private readonly logger = new Logger(EmailDeliveryService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'localhost'),
      port: Number(this.config.get('SMTP_PORT', 1025)),
      auth: this.config.get('SMTP_USER')
        ? {
            user: this.config.get('SMTP_USER'),
            pass: this.config.get('SMTP_PASS'),
          }
        : undefined,
    });
  }

  async deliver(to: string, topic: string, payload: Record<string, unknown>) {
    const devMode = this.config.get('EMAIL_DEV_MODE', 'true') === 'true';
    const subject = `Notification: ${topic}`;
    const html = `
      <h2>${topic}</h2>
      <p><strong>Event ID:</strong> ${payload.eventId}</p>
      <pre>${JSON.stringify(payload.payload ?? payload, null, 2)}</pre>
    `;

    if (devMode) {
      this.logger.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
    }

    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM', 'notifications@eventstream.local'),
      to,
      subject,
      html,
    });
  }
}
