import { CustomError } from '../middlewares';

export function expiryDate(expiry: string) {
  const numericExpiry = parseInt(expiry);
  const minute = 60 * 1000;
  const week = 7 * 24 * 60 * 60 * 1000;
  if (expiry.endsWith('m')) {
    return numericExpiry * minute;
  } else if (expiry.endsWith('w')) {
    return numericExpiry * week;
  } else {
    throw new CustomError('Invalid expiry date', 400);
  }
}
