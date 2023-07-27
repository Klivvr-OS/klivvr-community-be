import { userRepo, type UserRepo } from '../repos/userRepo';
import { Prisma } from '@prisma/client';
import sendGridEmail from '../../../mailers/sendEmail';
import { generateVerificationCode } from '../../../helpers/verificationCode';
import { CustomError } from '../../../middlewares';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendGridSubject, sendGridText, sendGridHTML } from '../../../config';

export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  createUserSchema = z
    .object({
      firstName: z
        .string()
        .min(3, { message: 'First name is too short' })
        .trim(),
      lastName: z.string().min(3, { message: 'Last name is too short' }).trim(),
      email: z.string().email({ message: 'Email must be unique' }).trim(),
      password: z.string().min(6, { message: 'Password is too short' }).trim(),
      photoURL: z.string().optional(),
    })
    .required();

  async createOne(args: Prisma.UserUncheckedCreateInput) {
    const existingUser = await this.userRepo.findOne({
      email: args.email,
    });
    if (existingUser != null) {
      throw new CustomError('User already exists', 409);
    }
    const code = generateVerificationCode();
    const hashedPassword = await bcrypt.hash(args.password, 12);
    const createdUser = await this.userRepo.createOne({
      ...args,
      password: hashedPassword,
      verificationCode: code,
    });
    await sendGridEmail(
      createdUser.email,
      sendGridSubject,
      sendGridText,
      `${sendGridHTML}<br><p>Your verification code is: <strong>${code}</strong></p>`,
    );
    if (createdUser == null) {
      throw new CustomError('Internal Server Error', 500);
    }
    return createdUser;
  }

  async findOne(args: Prisma.UserWhereInput) {
    return await this.userRepo.findOne({ email: args.email });
  }
}

export const userService = new UserService(userRepo);
