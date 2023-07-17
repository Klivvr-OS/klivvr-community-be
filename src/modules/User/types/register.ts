export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified?: boolean;
  verificationCode?: string;
}
