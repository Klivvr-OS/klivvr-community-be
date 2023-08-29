import { Prisma } from '@prisma/client';
import { NotificationRepo, notificationRepo } from '../repos/notificationRepo';
import { z } from 'zod';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  readonly createNotificationSchema = z
    .object({
      title: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
    })
    .required();

  async createOne(args: Prisma.NotificationUncheckedCreateInput) {
    return await this.notificationRepo.createOne(args);
  }

  async findMany(
    query: Prisma.NotificationWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.notificationRepo.findManyWithPagination(query, options);
  }
}

export const notificationService = new NotificationService(notificationRepo);
