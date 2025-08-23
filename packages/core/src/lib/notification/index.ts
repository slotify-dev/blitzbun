/* eslint-disable security/detect-object-injection */
import EmailNotification from './types/email';
import SMSNotification from './types/sms';

export type NotificationType = 'email' | 'sms';

export interface Notification {
  message: string;
  subject?: string;
  recipient: string;
}

type NotificationInstanceMap = {
  sms: SMSNotification;
  email: EmailNotification;
};

export default class NotificationService {
  private static instances: Partial<NotificationInstanceMap> = {};
  private constructor() {}

  static getInstance<T extends NotificationType>(
    type: T
  ): NotificationInstanceMap[T] {
    if (!this.instances[type]) {
      if (type === 'email') {
        this.instances[type] =
          new EmailNotification() as NotificationInstanceMap[T];
      } else if (type === 'sms') {
        this.instances[type] =
          new SMSNotification() as NotificationInstanceMap[T];
      }
    }
    return this.instances[type]!;
  }
}
