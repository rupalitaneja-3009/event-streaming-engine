export type SmsTemplateName =
  | 'order_confirmed'
  | 'payment_received'
  | 'otp_verification'
  | 'account_alert';

export const SMS_TEMPLATES: Record<
  SmsTemplateName,
  (data: Record<string, unknown>) => string
> = {
  order_confirmed: (data) =>
    `Hi! Your order #${data.orderId} of ₹${data.amount} is confirmed. Track: ${data.trackingUrl ?? 'N/A'}`,

  payment_received: (data) =>
    `₹${data.amount} received successfully. Transaction ID: ${data.txnId}. Thank you!`,

  otp_verification: (data) =>
    `Your OTP is ${data.otp}. Valid for 10 minutes. Do not share with anyone.`,

  account_alert: (data) =>
    `Security Alert: New login detected from ${data.location}. Not you? Contact support immediately.`,
};
