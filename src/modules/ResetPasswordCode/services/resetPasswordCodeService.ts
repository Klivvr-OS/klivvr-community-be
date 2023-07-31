import {
  ResetPasswordCodeRepo,
  resetPasswordCodeRepo,
} from '../repos/resetPasswordCodeRepo';
import { Prisma } from '@prisma/client';

export class ResetPasswordCodeService {
  constructor(private readonly resetPasswordCodeRepo: ResetPasswordCodeRepo) {}

  async createOne(args: Prisma.ResetPasswordCodeUncheckedCreateInput) {
    return await this.resetPasswordCodeRepo.createOne(args);
  }

  async findOne(args: Prisma.ResetPasswordCodeWhereInput) {
    return await this.resetPasswordCodeRepo.findOne(args);
  }

  async updateOne(
    query: Prisma.ResetPasswordCodeWhereUniqueInput,
    args: Prisma.ResetPasswordCodeUncheckedUpdateInput,
  ) {
    return await this.resetPasswordCodeRepo.updateOne(query, args);
  }
}

export const resetPasswordCodeService = new ResetPasswordCodeService(
  resetPasswordCodeRepo,
);
