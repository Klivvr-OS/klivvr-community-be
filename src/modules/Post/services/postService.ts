import { postRepo, type PostRepo } from '../repos/postRepo';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export class PostService {
  constructor(private readonly postRepo: PostRepo) {}

  readonly createPostSchema = z
    .object({
      description: z.string().nonempty({ message: 'Description is required' }),
    })
    .required();

  readonly updatePostSchema = z.object({
    description: z
      .string()
      .nonempty({ message: 'Description cannot be empty' })
      .optional(),
    image: z.string().optional(),
  });

  readonly createCommentSchema = z.object({
    content: z.string().nonempty({ message: 'Content is required' }),
  });

  readonly updateCommentSchema = z.object({
    content: z
      .string()
      .nonempty({ message: 'Content cannot be empty' })
      .optional(),
  });

  async createOne(args: Prisma.PostUncheckedCreateInput) {
    return await this.postRepo.createOne(args);
  }

  async findManyWithPagination(
    query: Prisma.PostWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.postRepo.findManyWithPagination(query, { ...options });
  }

  async findOne(query: Prisma.PostWhereUniqueInput) {
    return await this.postRepo.findOne(query);
  }

  async findUser(query: Prisma.PostWhereUniqueInput) {
    return await this.postRepo.findUser(query);
  }

  async updateOne(
    query: Prisma.PostWhereUniqueInput,
    args: Prisma.PostUpdateInput,
  ) {
    return await this.postRepo.updateOne(query, args);
  }

  async deleteOne(query: Prisma.PostWhereUniqueInput) {
    return await this.postRepo.deleteOne(query);
  }

  async addLike(args: Prisma.LikeUncheckedCreateInput) {
    return await this.postRepo.addLike(args);
  }

  async findLike(query: Prisma.LikeWhereInput) {
    return await this.postRepo.findLike(query);
  }

  async unlike(args: Prisma.LikeWhereUniqueInput) {
    return await this.postRepo.unlike(args);
  }

  async countLikesAndComments(
    options: {
      pageNumber: number;
      pageSize: number;
    },
    postId?: number,
  ) {
    return await this.postRepo.countLikesAndComments({ ...options }, postId);
  }

  async createComment(args: Prisma.CommentUncheckedCreateInput) {
    return await this.postRepo.createComment(args);
  }

  async findPostComments(
    query: Prisma.CommentWhereInput,
    options: {
      pageNumber: number;
      pageSize: number;
    },
  ) {
    return await this.postRepo.findPostComments(query, { ...options });
  }

  async findComment(query: Prisma.CommentWhereUniqueInput) {
    return await this.postRepo.findComment(query);
  }

  async updateComment(
    query: Prisma.CommentWhereUniqueInput,
    args: Prisma.CommentUpdateInput,
  ) {
    return await this.postRepo.updateComment(query, args);
  }

  async deleteComment(query: Prisma.CommentWhereUniqueInput) {
    return await this.postRepo.deleteComment(query);
  }
}

export const postService = new PostService(postRepo);
