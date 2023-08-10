import { Prisma } from '@prisma/client';
import { klivvrPickRepo, KlivvrPickRepo } from '../repos/klivvrPickRepo';
import { z } from 'zod';

export class KlivvrPickService {
  constructor(private readonly klivvrPickRepo: KlivvrPickRepo) {}

  createKlivvrPickSchema = z.object({
    name: z.string().trim(),
    description: z.string().trim(),
    link: z.string().trim(),
    category: z.string().trim(),
    photoURL: z.string().optional(),
  });

  updateKlivvrPickSchema = z.object({
    name: z.string().trim().optional(),
    description: z.string().trim().optional(),
    link: z.string().trim().optional(),
    category: z.string().trim().optional(),
    photoURL: z.string().optional(),
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

  async findThisWeeksPicks(options: { pageNumber: number; pageSize: number }) {
    return await this.klivvrPickRepo.findThisWeeksPick(options);
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
