import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';

export class KlivvrPickNomineeRepo {
  constructor(private readonly client: PrismaClient) {}

  async createOne(args: Prisma.KlivvrPickNomineeUncheckedCreateInput) {
    return await this.client.klivvrPickNominee.create({ data: args });
  }

  async findOne(
    query: Prisma.KlivvrPickNomineeWhereInput,
    options?: { select: Prisma.KlivvrPickNomineeSelect },
  ) {
    return await this.client.klivvrPickNominee.findFirst({
      where: query,
      ...options,
    });
  }

  async findMany() {
    return await this.client.klivvrPickNominee.findMany();
  }

  async updateOne(
    query: Prisma.KlivvrPickNomineeWhereUniqueInput,
    args: Prisma.KlivvrPickNomineeUpdateInput,
  ) {
    return await this.client.klivvrPickNominee.update({
      where: query,
      data: args,
    });
  }

  async upsertOne(
    nomineeId: number,
    nominatorId: number,
    startDate: Date,
    endDate: Date,
  ) {
    return await this.client.klivvrPickNominee.upsert({
      where: { nomineeId },
      create: { nomineeId, nominatorId, startDate, endDate },
      update: { startDate, endDate, nominatorId },
    });
  }

  async deleteOne(query: Prisma.KlivvrPickNomineeWhereUniqueInput) {
    return await this.client.klivvrPickNominee.delete({ where: query });
  }
}

export const klivvrPickNomineeRepo = new KlivvrPickNomineeRepo(prisma);
