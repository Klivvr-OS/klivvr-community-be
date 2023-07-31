import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';

export class ResetPasswordCodeRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async createOne(args: Prisma.ResetPasswordCodeUncheckedCreateInput) {
    return await this.prisma.resetPasswordCode.create({ data: args });
  }

  async findOne(query: Prisma.ResetPasswordCodeWhereInput) {
    return await this.prisma.resetPasswordCode.findFirst({ where: query });
  }

  async updateOne(
    query: Prisma.ResetPasswordCodeWhereUniqueInput,
    args: Prisma.ResetPasswordCodeUncheckedUpdateInput,
  ) {
    return await this.prisma.resetPasswordCode.update({
      where: query,
      data: args,
    });
  }
}

export const resetPasswordCodeRepo = new ResetPasswordCodeRepo(prisma);
