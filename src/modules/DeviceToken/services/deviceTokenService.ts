import { Prisma } from '@prisma/client';
import { DeviceTokenRepo, deviceTokenRepo } from '../repos/deviceTokenRepo';
import { z } from 'zod';
import { novuService } from '../../Novu';

export class DeviceTokenService {
  constructor(private readonly deviceTokenRepo: DeviceTokenRepo) {}

  readonly upsertDeviceTokenSchema = z
    .object({
      token: z.string(),
      deviceType: z.enum(['ANDROID', 'IOS']),
    })
    .required();

  async upsertOne(
    query: Prisma.DeviceTokenWhereUniqueInput,
    args: Prisma.DeviceTokenUncheckedCreateInput,
  ) {
    await Promise.all([
      this.deviceTokenRepo.upsertOne(query, args),
      novuService.setFcmDeviceToken(args.userId.toString(), args.token),
    ]);
  }

  async findMany() {
    return await this.deviceTokenRepo.findMany();
  }
}

export const deviceTokenService = new DeviceTokenService(deviceTokenRepo);
