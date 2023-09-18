import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../../../database/client';

export class DeviceTokenRepo {
  constructor(private readonly client: PrismaClient) {}

  async upsertOne(
    query: Prisma.DeviceTokenWhereUniqueInput,
    args: Prisma.DeviceTokenUncheckedCreateInput,
  ) {
    return await this.client.deviceToken.upsert({
      where: query,
      create: args,
      update: args,
    });
  }

  async findMany() {
    return await this.client.deviceToken.findMany({
      select: { token: true, userId: true },
    });
  }
}

export const deviceTokenRepo = new DeviceTokenRepo(prisma);
