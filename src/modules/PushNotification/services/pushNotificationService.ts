import admin from 'firebase-admin';
import { firebasePrivateKey } from '../../../config';

export class SendNotification {
  private intialized: boolean;
  constructor() {
    this.intialized = false;
  }
  private initializeApp() {
    if (!this.intialized) {
      admin.initializeApp({
        credential: admin.credential.cert(firebasePrivateKey),
      });
      this.intialized = true;
    }
  }
  async sendNotification(args: {
    deviceToken: string;
    title: string;
    description: string;
  }) {
    try {
      this.initializeApp();
      const { deviceToken, title, description } = args;
      const message = {
        notification: {
          title,
          body: description,
        },
        token: deviceToken,
      };
      await admin.messaging().send(message);
    } catch (err) {
      throw new Error();
    }
  }
}

export const sendNotificationService = new SendNotification();
