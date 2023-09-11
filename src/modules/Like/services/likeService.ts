import { type LikeRepo, likeRepo } from '../repos/likeRepo';
import { Prisma } from '@prisma/client';

export class LikeService {
  constructor(private readonly likeRepo: LikeRepo) {}

  async createOne(args: Prisma.LikeUncheckedCreateInput) {
    return await this.likeRepo.createOne(args);
  }

  async findOne(query: Prisma.LikeWhereInput) {
    return await this.likeRepo.findOne(query);
  }

  async deleteOne(args: Prisma.LikeWhereUniqueInput) {
    return await this.likeRepo.deleteOne(args);
  }
}

export const likeService = new LikeService(likeRepo);
