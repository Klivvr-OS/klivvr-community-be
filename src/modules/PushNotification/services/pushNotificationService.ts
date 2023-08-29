import admin from 'firebase-admin';
import { firebasePrivateKey } from '../../../config';

export class PushNotificationService {
  private intialized: boolean;
  constructor() {
    this.intialized = false;
    this.initializeApp();
  }
  private initializeApp() {
    if (!this.intialized) {
      admin.initializeApp({
        credential: admin.credential.cert(firebasePrivateKey),
      });
      this.intialized = true;
    }
  }
  async send(args: {
    deviceToken: string;
    title: string;
    description: string;
  }) {
    const { deviceToken, title, description } = args;
    const message = {
      notification: {
        title,
        body: description,
      },
      token: deviceToken,
    };
    await admin.messaging().send(message);
  }
}

export const pushNotificationService = new PushNotificationService();
