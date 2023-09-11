import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';
import { paginate } from '../../../helpers';

export class CommentRepo {
  constructor(private readonly client: PrismaClient) {}

  async createComment(args: Prisma.CommentUncheckedCreateInput) {
    return await this.client.comment.create({ data: args });
  }

  async findPostComments(
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

  async findComment(query: Prisma.CommentWhereUniqueInput) {
    return await this.client.comment.findFirst({ where: query });
  }

  async updateComment(
    query: Prisma.CommentWhereUniqueInput,
    args: Prisma.CommentUpdateInput,
  ) {
    return await this.client.comment.update({ where: query, data: args });
  }

  async deleteComment(query: Prisma.CommentWhereUniqueInput) {
    return await this.client.comment.delete({ where: query });
  }
}

export const commentRepo = new CommentRepo(prisma);
