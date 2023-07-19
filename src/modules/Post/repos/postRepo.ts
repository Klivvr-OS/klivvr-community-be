import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/prisma/client';

export class PostRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async createOne(args: Prisma.PostUncheckedCreateInput) {
    return await prisma.post.create({
      data: args,
    });
  }

  async findMany() {
    return await prisma.post.findMany();
  }

  async findOne(query: Prisma.PostWhereUniqueInput) {
    return await prisma.post.findFirst({
      where: query,
    });
  }

  async updateOne(query: Prisma.PostWhereUniqueInput, args: Prisma.PostUpdateInput) {
    return await prisma.post.update({
      where: query,
      data: args,
    });
  }
  async deleteOne(query: Prisma.PostWhereUniqueInput) {
    return await prisma.post.delete({
      where: query,
    });
  }
}

export const postRepo = new PostRepo(prisma);
