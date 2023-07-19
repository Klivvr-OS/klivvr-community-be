import sendGrid from '@sendgrid/mail';
import { sendGridAPIKey, sendGridFromEmail } from '../config';

sendGrid.setApiKey(sendGridAPIKey);

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
) {
  const msg = {
    to,
    from: sendGridFromEmail,
    subject,
    text,
    html,
  };

  try {
    await sendGrid.send(msg);
  } catch (err: unknown) {
    throw new Error(`Error sending email`);
  }
}

export default sendEmail;
