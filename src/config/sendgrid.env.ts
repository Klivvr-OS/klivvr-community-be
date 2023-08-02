import env from './env';

export const sendGridAPIKey = env('SENDGRID_API_KEY');
export const sendGridFromEmail = env('SENDGRID_FROM_EMAIL');
export const sendGridSubject = env('SENDGRID_SUBJECT');
export const sendGridText = env('SENDGRID_TEXT');
export const sendGridHTML = env('SENDGRID_HTML');
export const sendGridResetPasswordSubject = env(
  'SENDGRID_RESET_PASSWORD_SUBJECT',
);
export const sendGridResetPasswordText = env('SENDGRID_RESET_PASSWORD_TEXT');
export const sendGridResetPasswordHTML = env('SENDGRID_RESET_PASSWORD_HTML');
