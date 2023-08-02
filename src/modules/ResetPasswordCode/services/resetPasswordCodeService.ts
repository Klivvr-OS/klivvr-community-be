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

  async findOneByUserEmail(query: Prisma.ResetPasswordCodeWhereInput) {
    return await this.resetPasswordCodeRepo.findOneByUserEmail(query);
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

  async resetPasswordRequest(email: string) {
    const user = await userService.findOne({ email });
    if (user) {
      const userWithCode = await this.findOneByUserEmail({ user: { email } });
      const code = generateCode();
      if (!userWithCode) {
        await resetPasswordCodeRepo.createOne({
          userId: user.id,
          code: code,
        });
      } else {
        await resetPasswordCodeRepo.updateOne(
          { userId: userWithCode.userId },
          {
            code: code,
          },
        );
      }
      await sendGridEmail(
        user.email,
        sendGridResetPasswordSubject,
        sendGridResetPasswordText,
        `${sendGridResetPasswordHTML}<p>Your reset code is: <strong>${code}</strong></p>`,
      );
    }
    return {
      message:
        'If the email address is registered, a password reset link will be sent shortly.',
    };
  }

  async resetPassword(email: string, password: string, code: string) {
    const userWithCode = await resetPasswordCodeService.findOneByUserEmail({
      user: { email },
    });
    if (!userWithCode || userWithCode.code != code) {
      throw new CustomError('Invalid Credentials', 401);
    }

    const hashedPassword = await PasswordService.hashPassword(password);

    await userService.updateOne(
      { id: userWithCode.userId },
      {
        password: hashedPassword,
      },
    );
    await this.deleteOne({ userId: userWithCode.userId });
  }
}

export const resetPasswordCodeService = new ResetPasswordCodeService(
  resetPasswordCodeRepo,
);
