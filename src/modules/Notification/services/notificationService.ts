import { Prisma, Event } from '@prisma/client';
import { NotificationRepo, notificationRepo } from '../repos/notificationRepo';
import { eventService, userService, novuService } from '../../../modules';
import { getEventNotificationPayload } from './config';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  async createOne(args: Prisma.NotificationUncheckedCreateInput) {
    return await this.notificationRepo.createOne(args);
  }

  async sendEventsNotifications() {
    const todayEvents = (await eventService.findTodayEvents()) as Event[];
    const users = await userService.findUsersDeviceToken();
    for (const event of todayEvents) {
      for (const user of users) {
        const isCurrentUser = event.userId === user.id;
        const { title, description } = getEventNotificationPayload({
          name: event.name,
          isCurrentUser,
          eventType: event.eventType,
        });
        await Promise.all([
          novuService.triggerNotification(
            { title, description },
            user.id.toString(),
          ),
          this.createOne({
            title,
            description,
            userId: user.id,
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
