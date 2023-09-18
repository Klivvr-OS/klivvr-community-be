import { Prisma } from '@prisma/client';
import { NotificationRepo, notificationRepo } from '../repos/notificationRepo';
import {
  eventService,
  deviceTokenService,
  novuService,
} from '../../../modules';
import { getEventNotificationPayload } from './config';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  async createOne(args: Prisma.NotificationUncheckedCreateInput) {
    return await this.notificationRepo.createOne(args);
  }

  async sendEventsNotifications() {
    const todayEvents = await eventService.findTodayEvents();
    const users = await deviceTokenService.findMany();
    for (const event of todayEvents) {
      for (const user of users) {
        const isCurrentUser = event.userId === user.userId;
        const { title, description } = getEventNotificationPayload({
          name: event.name,
          isCurrentUser,
          type: event.type,
        });
        await Promise.all([
          novuService.triggerNotification(
            { title, description },
            user.userId.toString(),
          ),
          this.createOne({
            title,
            description,
            userId: user.userId,
          }),
        ]);
      }
    }
  }

  async findManyWithPagination(
    query: Prisma.NotificationWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.notificationRepo.findManyWithPagination(query, options);
  }
}

export const notificationService = new NotificationService(notificationRepo);
