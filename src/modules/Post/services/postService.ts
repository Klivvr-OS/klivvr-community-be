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

  readonly updateCommentSchema = z
    .object({
      content: z.string(),
    })
    .required();

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

  async updateOne(
    query: Prisma.PostWhereUniqueInput,
    args: Prisma.PostUpdateInput,
  ) {
    return await this.postRepo.updateOne(query, args);
  }

  async deleteOne(query: Prisma.PostWhereUniqueInput) {
    return await this.postRepo.deleteOne(query);
  }

  async postsWithLikesAndComments(
    options: {
      pageNumber: number;
      pageSize: number;
    },
    postId?: number,
    userId?: number,
  ) {
    return await this.postRepo.postsWithLikesAndComments(
      { ...options },
      postId,
      userId,
    );
  }
}

export const postService = new PostService(postRepo);
