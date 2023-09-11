import { type LikeRepo, likeRepo } from '../repos/likeRepo';
import { Prisma } from '@prisma/client';

export class LikeService {
  constructor(private readonly likeRepo: LikeRepo) {}

  async addLike(args: Prisma.LikeUncheckedCreateInput) {
    return await this.likeRepo.addLike(args);
  }

  async findLike(query: Prisma.LikeWhereInput) {
    return await this.likeRepo.findLike(query);
  }

  async unlike(args: Prisma.LikeWhereUniqueInput) {
    return await this.likeRepo.unlike(args);
  }
}

export const likeService = new LikeService(likeRepo);
