import { PublishCommand, PublishCommandOutput, SNSClient } from "@aws-sdk/client-sns";
import type { Notification } from "..";
import BaseNotification from "../contracts/notification";

export default class SMSNotification extends BaseNotification<string> {
  private readonly client: SNSClient;

  constructor() {
    super();
    this.client = new SNSClient({
      region: this.envService.get("AWS_REGION"),
      credentials: {
        accessKeyId: this.envService.get("AWS_KEY"),
        secretAccessKey: this.envService.get("AWS_SECRET"),
      },
    });
  }

  async send(notification: Notification): Promise<PublishCommandOutput> {
    return this.client.send(
      new PublishCommand({
        Message: notification.message,
        PhoneNumber: notification.recipient,
      })
    );
  }
}
