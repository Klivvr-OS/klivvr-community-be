import admin from 'firebase-admin';
import { firebasePrivateKey } from '../../../config';

admin.initializeApp({
  credential: admin.credential.cert(firebasePrivateKey),
});

export async function sendNotifications(
  deviceToken: string,
  title: string,
  description: string,
) {
  const message = {
    notification: {
      title,
      body: description,
    },
    token: deviceToken,
  };
  try {
    await admin.messaging().send(message);
  } catch (err) {
    throw new Error();
  }
}
