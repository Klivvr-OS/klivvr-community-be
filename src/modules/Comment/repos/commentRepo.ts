import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';
import { paginate } from '../../../helpers';

export class CommentRepo {
  constructor(private readonly client: PrismaClient) {}

  async createOne(args: Prisma.CommentUncheckedCreateInput) {
    return await this.client.comment.create({ data: args });
  }

  async findManyWithPagination(
    query: Prisma.CommentWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.client.comment.findMany({
      where: query,
      ...paginate(options),
      include: {
        user: { select: { firstName: true, lastName: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(query: Prisma.CommentWhereUniqueInput) {
    return await this.client.comment.findFirst({ where: query });
  }

  async updateOne(
    query: Prisma.CommentWhereUniqueInput,
    args: Prisma.CommentUpdateInput,
  ) {
    return await this.client.comment.update({ where: query, data: args });
  }

  async deleteOne(query: Prisma.CommentWhereUniqueInput) {
    return await this.client.comment.delete({ where: query });
  }
}

export const commentRepo = new CommentRepo(prisma);
