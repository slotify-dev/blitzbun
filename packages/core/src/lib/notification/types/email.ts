import { SESClient, SendEmailCommand, SendEmailCommandOutput } from "@aws-sdk/client-ses";

import type { Notification } from "..";
import BaseNotification from "../contracts/notification";

export default class EmailNotification extends BaseNotification<string> {
  private readonly client: SESClient;
  private readonly source: string;

  constructor() {
    super();
    this.source = this.envService.get("AWS_REPLY_FROM")
    this.client = new SESClient({
      region: this.envService.get("AWS_REGION"),
      credentials: {
        accessKeyId: this.envService.get("AWS_KEY"),
        secretAccessKey: this.envService.get("AWS_SECRET"),
      },
    });
  }

  async send(notification: Notification): Promise<SendEmailCommandOutput> {
    try {
      return await this.client.send(
        new SendEmailCommand({
          Source: this.source,
          Destination: { ToAddresses: [notification.recipient] },
          Message: {
            Body: { Html: { Charset: "UTF-8", Data: notification.message } },
            Subject: { Charset: "UTF-8", Data: notification.subject ?? "" },
          },
        })
      );
    } catch (e) {
      console.error("Email Failed: ", (e as Error).message);
      throw e;
    }
  }
}
