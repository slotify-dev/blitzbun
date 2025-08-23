import { EnvContract } from '@blitzbun/contracts';
import type { Notification } from '..';
import { AppContext } from '../../../classes/context';

export default abstract class BaseNotification<AttachmentType = unknown> {
  protected readonly envService: EnvContract;
  protected attachments: AttachmentType[] = [];

  constructor() {
    this.envService = AppContext.get().resolve('env');
  }

  attach(attachment: AttachmentType): this {
    this.attachments.push(attachment);
    return this;
  }

  abstract send(notification: Notification): Promise<unknown>;
}
