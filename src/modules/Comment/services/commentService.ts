import { commentRepo, type CommentRepo } from '../repos/commentRepo';
import { Prisma } from '@prisma/client';

export class CommentService {
  constructor(private readonly commentRepo: CommentRepo) {}

  async createComment(args: Prisma.CommentUncheckedCreateInput) {
    return await this.commentRepo.createComment(args);
  }

  async findPostComments(
    query: Prisma.CommentWhereInput,
    options: {
      pageNumber: number;
      pageSize: number;
    },
  ) {
    return await this.commentRepo.findPostComments(query, { ...options });
  }

  async findComment(query: Prisma.CommentWhereUniqueInput) {
    return await this.commentRepo.findComment(query);
  }

  async updateComment(
    query: Prisma.CommentWhereUniqueInput,
    args: Prisma.CommentUpdateInput,
  ) {
    return await this.commentRepo.updateComment(query, args);
  }

  async deleteComment(query: Prisma.CommentWhereUniqueInput) {
    return await this.commentRepo.deleteComment(query);
  }
}

export const commentService = new CommentService(commentRepo);
