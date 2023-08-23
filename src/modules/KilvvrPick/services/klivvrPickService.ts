import { Prisma } from '@prisma/client';
import { klivvrPickRepo, KlivvrPickRepo } from '../repos/klivvrPickRepo';
import { z } from 'zod';
import { CustomError } from '../../../middlewares';

export class KlivvrPickService {
  constructor(private readonly klivvrPickRepo: KlivvrPickRepo) {}

  readonly createKlivvrPickSchema = z.object({
    name: z.string().trim().nonempty(),
    description: z.string().trim().nonempty(),
    link: z.string().trim().nonempty(),
    category: z.string().trim().nonempty(),
    image: z.string().optional(),
  });

  readonly updateKlivvrPickSchema = z.object({
    name: z.string().trim().nonempty().optional(),
    description: z.string().trim().nonempty().optional(),
    link: z.string().trim().nonempty().optional(),
    category: z.string().trim().nonempty().optional(),
    image: z.string().optional(),
  });

  async createOne(args: Prisma.KlivvrPickUncheckedCreateInput) {
    return await this.klivvrPickRepo.createOne(args);
  }

  async findManyWithPagination(
    query: Prisma.KlivvrPickWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.klivvrPickRepo.findManyWithPagination(query, options);
  }

  async findOne(
    query: Prisma.KlivvrPickWhereUniqueInput,
    options?: { select: Prisma.KlivvrPickSelect },
  ) {
    return await this.klivvrPickRepo.findOne(query, options);
  }

  async findOneWithError(
    query: Prisma.KlivvrPickWhereUniqueInput,
    options?: { select: Prisma.KlivvrPickSelect },
  ) {
    const klivvrPick = await this.klivvrPickRepo.findOne(query, options);
    if (!klivvrPick) throw new CustomError('Klivvr Pick is Not Found', 404);
    return klivvrPick;
  }

  async findThisWeeksPicks(options: { pageNumber: number; pageSize: number }) {
    return await this.klivvrPickRepo.findThisWeeksPick(options);
  }

  async findPickByUser(
    query: { userId: number },
    options?: { select: Prisma.KlivvrPickSelect },
  ) {
    return await this.klivvrPickRepo.findPickByUser(query, options);
  }

  async updateOne(
    query: Prisma.KlivvrPickWhereUniqueInput,
    args: Prisma.KlivvrPickUpdateInput,
  ) {
    return await this.klivvrPickRepo.updateOne(query, args);
  }

  async deleteOne(query: Prisma.KlivvrPickWhereUniqueInput) {
    return await this.klivvrPickRepo.deleteOne(query);
  }
}

export const klivvrPickService = new KlivvrPickService(klivvrPickRepo);
