import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';

export class UserRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async createOne(args: Prisma.UserUncheckedCreateInput) {
    return await this.prisma.user.create({ data: args });
  }

  async findOne(query: Prisma.UserWhereInput) {
    return await this.prisma.user.findFirst({ where: query });
  }

  async findOneWithCode(query: Prisma.UserWhereInput) {
    return await this.prisma.user.findFirst({
      where: query,
      include: { resetPasswordCode: true },
    });
  }

  async updateOne(
    query: Prisma.UserWhereUniqueInput,
    args: Prisma.UserUncheckedUpdateInput,
  ) {
    return await this.prisma.user.update({ where: query, data: args });
  }
}

export const userRepo = new UserRepo(prisma);
