import { Prisma, Event } from '@prisma/client';
import { NotificationRepo, notificationRepo } from '../repos/notificationRepo';
import { eventService, userService, novuService } from '../../../modules';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  async createOne(args: Prisma.NotificationUncheckedCreateInput) {
    return await this.notificationRepo.createOne(args);
  }

  async sendEventsNotifications() {
    const events = (await eventService.findThisWeekEvents({
      pageNumber: 1,
      pageSize: 10,
    })) as Event[];
    const todayEvents = events.filter((event) => {
      return eventService.isEventToday(new Date(event.date));
    });
    const users = await userService.findUsersDeviceToken();
    for (const event of todayEvents) {
      for (const user of users) {
        let title = '',
          description = '';
        if (
          (user.id === event.userId && event.eventType === 'BIRTHDAY') ||
          (user.id === event.userId && event.eventType === 'ANNIVERSARY')
        ) {
          title = `Today is your ${event.eventType.toLowerCase()} 🎉`;
          description = `Happy ${event.eventType.toLowerCase()} ${
            eventService.convertEventStringsToTitleAndType(
              event.name,
              event.eventType,
            ).eventTitle
          }!`;
        } else if (user.id === event.userId) {
          return;
        } else if (
          event.eventType === 'BIRTHDAY' ||
          event.eventType === 'ANNIVERSARY'
        ) {
          title = `Today is ${event.name} 🎉`;
          description = `Don't miss to wish ${
            eventService.convertEventStringsToTitleAndType(
              event.name,
              event.eventType,
            ).eventTitle
          } a happy ${
            eventService.convertEventStringsToTitleAndType(
              event.name,
              event.eventType,
            ).newType
          }!`;
        }
        await Promise.all([
          novuService.triggerNotification(
            { title, description },
            user.id.toString(),
          ),
          this.createOne({ title, description, userId: user.id }),
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
