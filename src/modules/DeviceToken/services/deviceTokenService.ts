import { Prisma } from '@prisma/client';
import { DeviceTokenRepo, deviceTokenRepo } from '../repos/deviceTokenRepo';
import { z } from 'zod';

export class DeviceTokenService {
  constructor(private readonly deviceTokenRepo: DeviceTokenRepo) {}

  readonly createDeviceTokenSchema = z
    .object({
      token: z.string(),
      deviceType: z.enum(['ANDROID', 'IOS']),
    })
    .required();

  async createOne(args: Prisma.DeviceTokenUncheckedCreateInput) {
    return await this.deviceTokenRepo.createOne(args);
  }

  async findOne(query: Prisma.DeviceTokenWhereInput) {
    return await this.deviceTokenRepo.findOne(query);
  }

  async updateOne(
    query: Prisma.DeviceTokenWhereUniqueInput,
    args: Prisma.DeviceTokenUncheckedUpdateInput,
  ) {
    return await this.deviceTokenRepo.updateOne(query, args);
  }
}

export const deviceTokenService = new DeviceTokenService(deviceTokenRepo);
