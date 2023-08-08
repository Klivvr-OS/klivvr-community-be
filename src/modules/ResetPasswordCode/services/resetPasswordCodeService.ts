import {
  sendGridResetPasswordSubject,
  sendGridResetPasswordText,
  sendGridResetPasswordHTML,
} from '../../../config';
import sendGridEmail from '../../../mailers/sendEmail';
import { PasswordService, generateCode } from '../../../helpers';
import { CustomError } from '../../../middlewares';
import { userService } from '../../User';
import {
  ResetPasswordCodeRepo,
  resetPasswordCodeRepo,
} from '../repos/resetPasswordCodeRepo';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export class ResetPasswordCodeService {
  constructor(private readonly resetPasswordCodeRepo: ResetPasswordCodeRepo) {}
  resetPasswordRequestSchema = z
    .object({ email: z.string().email().toLowerCase().trim() })
    .required();
  resetPasswordSchema = z
    .object({
      email: z.string().email().toLowerCase().trim(),
      password: z.string().min(6, { message: 'Password is too short' }).trim(),
      resetPasswordCode: z
        .string()
        .nonempty({ message: 'Code is required' })
        .trim(),
    })
    .required();

  async createOne(args: Prisma.ResetPasswordCodeUncheckedCreateInput) {
    return await this.resetPasswordCodeRepo.createOne(args);
  }

  async findOne(args: Prisma.ResetPasswordCodeWhereInput) {
    return await this.resetPasswordCodeRepo.findOne(args);
  }

  async findOneByUserEmail(query: { email: string }) {
    return await this.resetPasswordCodeRepo.findOneByUserEmail(query);
  }

  async updateOne(
    query: Prisma.ResetPasswordCodeWhereUniqueInput,
    args: Prisma.ResetPasswordCodeUncheckedUpdateInput,
  ) {
    return await this.resetPasswordCodeRepo.updateOne(query, args);
  }

  async upsertOne(userId: number, code: string) {
    return await this.resetPasswordCodeRepo.upsertOne(userId, code);
  }

  async deleteOne(query: Prisma.ResetPasswordCodeWhereUniqueInput) {
    return await this.resetPasswordCodeRepo.deleteOne(query);
  }

  async resetPasswordRequest(email: string) {
    const user = await userService.findOneByEmail({ email });
    if (!user) {
      return;
    }
    const code = generateCode();
    await this.upsertOne(user.id, code);
    await sendGridEmail(
      user.email,
      sendGridResetPasswordSubject,
      sendGridResetPasswordText,
      `${sendGridResetPasswordHTML}<p>Your reset code is: <strong>${code}</strong></p>`,
    );
  }

  async resetPassword(email: string, password: string, code: string) {
    const userWithCode = await resetPasswordCodeService.findOneByUserEmail({
      email,
    });
    if (!userWithCode || userWithCode.code != code) {
      throw new CustomError('Invalid Credentials', 401);
    }

    const hashedPassword = await PasswordService.hashPassword(password);

    await userService.updateOne(
      { id: userWithCode.userId },
      { password: hashedPassword },
    );
    await this.deleteOne({ userId: userWithCode.userId });
  }
}

export const resetPasswordCodeService = new ResetPasswordCodeService(
  resetPasswordCodeRepo,
);
