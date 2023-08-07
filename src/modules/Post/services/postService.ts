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
    photoURL: z.string().optional(),
  });

  async createOne(args: Prisma.PostUncheckedCreateInput) {
    return await this.postRepo.createOne(args);
  }

  async findManyWithPagination(
    query: Prisma.PostWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.postRepo.findMany(query, { ...options });
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
}

export const postService = new PostService(postRepo);
