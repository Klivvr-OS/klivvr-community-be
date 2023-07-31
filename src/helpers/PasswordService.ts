import bcrypt from 'bcryptjs';

const SALT_LENGTH = 12;

export class PasswordService {
  static async hashPassword(password: string) {
    return await bcrypt.hash(password, SALT_LENGTH);
  }

  static async comparePasswords(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
