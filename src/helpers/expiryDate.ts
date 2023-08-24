import { CustomError } from '../middlewares';
import timestring from 'timestring';

export function expiryDate(expiry: string) {
  if (!expiry) {
    throw new CustomError('Invalid expiry date', 400);
  }
  return timestring(expiry, 'ms');
}
