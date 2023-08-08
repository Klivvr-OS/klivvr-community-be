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
      orderBy: { createdAt: 'desc' },
      select: {
        firstName: true,
        lastName: true,
        photoURL: true,
        phone: true,
      },
    });
  }

  async findOneByEmail(query: Prisma.UserWhereInput) {
    return await this.prisma.user.findFirst({ where: query });
  }

  async findOneById(query: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.findUnique({
      where: query,
      select: {
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthdate: true,
        likes: true,
        favoriteClubs: true,
        preferredFoods: true,
        hobbies: true,
        photoURL: true,
      },
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
