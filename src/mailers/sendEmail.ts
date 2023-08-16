import sendGrid from '@sendgrid/mail';
import { sendGridAPIKey, sendGridFromEmail, sendGridHTML } from '../config';

sendGrid.setApiKey(sendGridAPIKey);

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
) {
  const msg = { to, from: sendGridFromEmail, subject, text, html };

  try {
    await sendGrid.send(msg);
  } catch (err: unknown) {
    throw new Error(`Error sending email`);
  }
}

export async function sendingEmails(
  args: {
    to: string;
    subject: string;
    text: string;
    html: string;
  },
  code: string,
) {
  const { to, subject, text } = args;
  const msg = {
    to,
    subject,
    text,
    html: `${sendGridHTML}<br><p>Your verification code is: <strong>${code}</strong></p>`,
  };
  await sendEmail(msg.to, msg.subject, msg.text, msg.html);
}

export default sendEmail;
