import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/prisma/client';

export class PostRepo {
  constructor(private readonly client: PrismaClient) {}

  async createOne(args: Prisma.PostUncheckedCreateInput) {
    return await this.client.post.create({
      data: args,
    });
  }

  async findMany() {
    return await this.client.post.findMany();
  }

  async findOne(query: Prisma.PostWhereUniqueInput) {
    return await this.client.post.findFirst({
      where: query,
    });
  }

  async updateOne(query: Prisma.PostWhereUniqueInput, args: Prisma.PostUpdateInput) {
    return await this.client.post.update({
      where: query,
      data: args,
    });
  }
  async deleteOne(query: Prisma.PostWhereUniqueInput) {
    return await this.client.post.delete({
      where: query,
    });
  }
}

export const postRepo = new PostRepo(prisma);
