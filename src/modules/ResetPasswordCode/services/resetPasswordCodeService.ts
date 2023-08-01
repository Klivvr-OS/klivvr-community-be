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
    .object({
      email: z.string().email().trim(),
    })
    .required();
  resetPasswordSchema = z
    .object({
      email: z.string().email().trim(),
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

  async findUserWithCode(args: Prisma.UserWhereInput) {
    return await this.resetPasswordCodeRepo.findUserWithCode(args);
  }

  async updateOne(
    query: Prisma.ResetPasswordCodeWhereUniqueInput,
    args: Prisma.ResetPasswordCodeUncheckedUpdateInput,
  ) {
    return await this.resetPasswordCodeRepo.updateOne(query, args);
  }

  async deleteOne(query: Prisma.ResetPasswordCodeWhereUniqueInput) {
    return await this.resetPasswordCodeRepo.deleteOne(query);
  }

  async resetPasswordRequest(args: Prisma.UserWhereInput) {
    const userWithCode = await resetPasswordCodeService.findUserWithCode({
      email: args.email,
    });
    const user = await userService.findOne({ email: args.email });
    if (!userWithCode) {
      throw new CustomError('Invalid Credentials', 401);
    }
    const code = generateCode();
    if (!userWithCode.resetPasswordCode) {
      await resetPasswordCodeRepo.createOne({
        userId: userWithCode.id,
        code: code,
      });
    } else {
      await resetPasswordCodeRepo.updateOne(
        { userId: userWithCode.id },
        {
          code: code,
        },
      );
    }
    await sendGridEmail(
      userWithCode.email,
      sendGridResetPasswordSubject,
      sendGridResetPasswordText,
      `${sendGridResetPasswordHTML}<p>Your reset code is: <strong>${code}</strong></p>`,
    );
  }

  async resetPassword(email: string, password: string, code: string) {
    const userWithCode = await resetPasswordCodeService.findUserWithCode({
      email,
    });
    if (!userWithCode) {
      throw new CustomError('Invalid Credentials', 401);
    }
    if (!userWithCode.resetPasswordCode) {
      throw new CustomError('Invalid Credentials', 401);
    }
    if (userWithCode.resetPasswordCode.code != code) {
      throw new CustomError('Invalid Credentials', 401);
    }
    const hashedPassword = await PasswordService.hashPassword(password);

    await userService.updateOne(
      { id: userWithCode.id },
      {
        password: hashedPassword,
      },
    );

    await this.deleteOne({ userId: userWithCode.id });
  }
}

export const resetPasswordCodeService = new ResetPasswordCodeService(
  resetPasswordCodeRepo,
);
