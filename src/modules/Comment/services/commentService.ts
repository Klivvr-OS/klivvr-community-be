import { commentRepo, type CommentRepo } from '../repos/commentRepo';
import { Prisma } from '@prisma/client';

export class CommentService {
  constructor(private readonly commentRepo: CommentRepo) {}

  async createOne(args: Prisma.CommentUncheckedCreateInput) {
    return await this.commentRepo.createOne(args);
  }

  async findManyWithPagination(
    query: Prisma.CommentWhereInput,
    options: {
      pageNumber: number;
      pageSize: number;
    },
  ) {
    return await this.commentRepo.findManyWithPagination(query, { ...options });
  }

  async findOne(query: Prisma.CommentWhereUniqueInput) {
    return await this.commentRepo.findOne(query);
  }

  async updateOne(
    query: Prisma.CommentWhereUniqueInput,
    args: Prisma.CommentUpdateInput,
  ) {
    return await this.commentRepo.updateOne(query, args);
  }

  async deleteOne(query: Prisma.CommentWhereUniqueInput) {
    return await this.commentRepo.deleteOne(query);
  }
}

export const commentService = new CommentService(commentRepo);
