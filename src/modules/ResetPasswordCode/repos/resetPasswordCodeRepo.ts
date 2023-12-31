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

  async findOneByUserEmail(query: { email: string }) {
    return await this.prisma.resetPasswordCode.findFirst({
      where: { user: query },
      include: { user: true },
    });
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

  async upsertOne(userId: number, code: string) {
    return await this.prisma.resetPasswordCode.upsert({
      where: { userId },
      create: { userId, code },
      update: { code },
    });
  }

  async deleteOne(query: Prisma.ResetPasswordCodeWhereUniqueInput) {
    return await this.prisma.resetPasswordCode.delete({ where: query });
  }
}

export const resetPasswordCodeRepo = new ResetPasswordCodeRepo(prisma);
