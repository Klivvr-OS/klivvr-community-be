import admin from 'firebase-admin';
import { firebasePrivateKey } from '../../../config';

admin.initializeApp({
  credential: admin.credential.cert(firebasePrivateKey),
});

export async function sendNotification(args: {
  deviceToken: string;
  title: string;
  description: string;
}) {
  try {
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
