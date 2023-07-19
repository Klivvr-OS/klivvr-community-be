import sendGrid from '@sendgrid/mail';
import { sendGridAPIKey, sendGridFromEmail } from '../config';
import { type sendVerificationEmail as sendGridType } from '../mailers/types/sendEmail';

sendGrid.setApiKey(sendGridAPIKey);

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  const msg: sendGridType = {
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
