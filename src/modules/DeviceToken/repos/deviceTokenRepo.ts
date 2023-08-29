import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../../../database/client';

export class DeviceTokenRepo {
  constructor(private readonly client: PrismaClient) {}

  async createOne(args: Prisma.DeviceTokenUncheckedCreateInput) {
    return await this.client.deviceToken.create({ data: args });
  }

  async findOne(query: Prisma.DeviceTokenWhereInput) {
    return await this.client.deviceToken.findFirst({ where: query });
  }

  async updateOne(
    query: Prisma.DeviceTokenWhereUniqueInput,
    args: Prisma.DeviceTokenUncheckedUpdateInput,
  ) {
    return await this.client.deviceToken.update({ where: query, data: args });
  }

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
}

export const deviceTokenRepo = new DeviceTokenRepo(prisma);
