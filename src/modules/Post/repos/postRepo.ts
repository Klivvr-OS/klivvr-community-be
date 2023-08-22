import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';
import { paginate } from '../../../helpers';

export class PostRepo {
  constructor(private readonly client: PrismaClient) {}

  async createOne(args: Prisma.PostUncheckedCreateInput) {
    return await this.client.post.create({ data: args });
  }

  async findManyWithPagination(
    query: Prisma.PostWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.client.post.findMany({
      where: query,
      ...paginate(options),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(query: Prisma.PostWhereUniqueInput) {
    return await this.client.post.findFirst({ where: query });
  }

  async updateOne(
    query: Prisma.PostWhereUniqueInput,
    args: Prisma.PostUpdateInput,
  ) {
    return await this.client.post.update({ where: query, data: args });
  }

  async deleteOne(query: Prisma.PostWhereUniqueInput) {
    return await this.client.post.delete({ where: query });
  }

  async addLike(args: Prisma.LikeUncheckedCreateInput) {
    return await this.client.like.create({ data: args });
  }

  async findLike(query: Prisma.LikeWhereInput) {
    return await this.client.like.findFirst({ where: query });
  }

  async unlike(args: Prisma.LikeWhereUniqueInput) {
    return await this.client.like.delete({ where: args });
  }

  async countLikes(query: Prisma.LikeWhereInput) {
    return await this.client.like.groupBy({
      by: ['postId'],
      _count: { postId: true },
      where: query,
    });
  }

  async createComment(args: Prisma.CommentUncheckedCreateInput) {
    return await this.client.comment.create({ data: args });
  }

  async countComments(query: Prisma.CommentWhereInput) {
    return await this.client.comment.groupBy({
      by: ['postId'],
      _count: { postId: true },
      where: query,
    });
  }

  async findPostComments(
    query: Prisma.CommentWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.client.comment.findMany({
      where: query,
      ...paginate(options),
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const postRepo = new PostRepo(prisma);
