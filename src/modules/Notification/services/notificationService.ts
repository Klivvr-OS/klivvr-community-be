import { Prisma } from '@prisma/client';
import { NotificationRepo, notificationRepo } from '../repos/notificationRepo';
import { z } from 'zod';
import { sendNotificationService } from '../../PushNotification';
import { deviceTokenService } from '../../DeviceToken';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  readonly createNotificationSchema = z
    .object({
      title: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
    })
    .required();

  async createOne(args: Prisma.NotificationUncheckedCreateInput) {
    const deviceToken = await deviceTokenService.findOne({
      userId: args.userId,
    });
    if (deviceToken?.token) {
      return await Promise.all([
        this.notificationRepo.createOne(args),
        sendNotificationService.sendNotification({
          deviceToken: deviceToken?.token,
          title: args.title,
          description: args.description,
        }),
      ]);
    }
  }

  async findMany(
    query: Prisma.NotificationWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.notificationRepo.findManyWithPagination(query, options);
  }
}

export const notificationService = new NotificationService(notificationRepo);
