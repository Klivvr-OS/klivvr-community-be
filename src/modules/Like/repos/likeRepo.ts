import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';

export class LikeRepo {
  constructor(private readonly client: PrismaClient) {}

  async addLike(args: Prisma.LikeUncheckedCreateInput) {
    return await this.client.like.create({ data: args });
  }

  async findLike(query: Prisma.LikeWhereInput) {
    return await this.client.like.findFirst({ where: query });
  }

  async unlike(args: Prisma.LikeWhereUniqueInput) {
    return await this.client.like.delete({ where: args });
  }
}

export const likeRepo = new LikeRepo(prisma);
