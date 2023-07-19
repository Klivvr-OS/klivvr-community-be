import { postRepo, type PostRepo } from '../repos/postRepo';
import { Prisma } from '@prisma/client';

export class PostService {
  constructor(private readonly postRepo: PostRepo) {}

  async createOne(args: Prisma.PostUncheckedCreateInput) {
    return await this.postRepo.createOne(args);
  }

  async findMany() {
    return await this.postRepo.findMany();
  }

  async findOne(query: Prisma.PostWhereUniqueInput) {
    return await this.postRepo.findOne(query);
  }

  async updateOne(query: Prisma.PostWhereUniqueInput, args: Prisma.PostUpdateInput) {
    return await this.postRepo.updateOne(query, args);
  }

  async deleteOne(query: Prisma.PostWhereUniqueInput) {
    return await this.postRepo.deleteOne(query);
  }

}

export const postService = new PostService(postRepo);
