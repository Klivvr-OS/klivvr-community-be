import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';
import { paginate } from '../../../helpers';

export class UserRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async createOne(args: Prisma.UserUncheckedCreateInput) {
    return await this.prisma.user.create({ data: args });
  }

  async findManyWithPagination(
    query: Prisma.UserWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.prisma.user.findMany({
      where: query,
      ...paginate(options),
      orderBy: { createdAt: 'asc' },
      select: {
        firstName: true,
        lastName: true,
        photoURL: true,
        phone: true,
      },
    });
  }

  async findOne(
    query: Prisma.UserWhereInput,
    options?: { select: Prisma.UserSelect },
  ) {
    return await this.prisma.user.findFirst({ where: query, ...options });
  }

  async updateOne(
    query: Prisma.UserWhereUniqueInput,
    args: Prisma.UserUncheckedUpdateInput,
  ) {
    return await this.prisma.user.update({ where: query, data: args });
  }
}

export const userRepo = new UserRepo(prisma);
