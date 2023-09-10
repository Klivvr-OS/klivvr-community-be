import { Prisma, Event } from '@prisma/client';
import { NotificationRepo, notificationRepo } from '../repos/notificationRepo';
import { pushNotificationService } from '../../PushNotification';
import { eventService } from '../../Event';
import { userService } from '../../User';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  async createOne(args: Prisma.NotificationUncheckedCreateInput) {
    return await this.notificationRepo.createOne(args);
  }

  isEventToday(eventDate: Date) {
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth()
    );
  }

  convertEventStringsToTitleAndType(eventName: string, eventType: string) {
    const eventNameParts = eventName.split(' ');
    const firstTwoWords = eventNameParts.splice(0, 2).join(' ');
    const capitalizedEventType =
      eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase();
    return { eventTitle: firstTwoWords, newType: capitalizedEventType };
  }

  async sendEventsNotifications() {
    const events = (await eventService.findThisWeekEvents({
      pageNumber: 1,
      pageSize: 10,
    })) as Array<Event>;
    const todayEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return this.isEventToday(eventDate);
    });
    const users = await userService.findUsersDeviceToken();
    todayEvents.forEach((event: Event) => {
      users.forEach(async (user) => {
        let title = '',
          description = '';
        if (user.id === event.userId && event.eventType === 'BIRTHDAY') {
          title = `Today is your Birthday 🎉`;
          description = `Happy birthday to you!`;
        } else if (
          user.id === event.userId &&
          event.eventType === 'ANNIVERSARY'
        ) {
          title = `Today is your Anniversary 🎉`;
          description = `Happy anniversary to you!`;
        } else if (user.id === event.userId) return;
        else if (event.eventType === 'BIRTHDAY') {
          title = `Today is ${event.name} 🎉`;
          description = `Don't miss to wish ${
            this.convertEventStringsToTitleAndType(event.name, event.eventType)
              .eventTitle
          } a happy ${
            this.convertEventStringsToTitleAndType(event.name, event.eventType)
              .newType
          }!`;
        } else if (event.eventType === 'ANNIVERSARY') {
          title = `Today is ${event.name} 🎉`;
          description = `Don't miss to wish ${
            this.convertEventStringsToTitleAndType(event.name, event.eventType)
              .eventTitle
          } a happy ${
            this.convertEventStringsToTitleAndType(event.name, event.eventType)
              .newType
          }!`;
        } else if (event.eventType === 'WEDDING') {
          title = `Today is ${event.name} 🤵👰`;
          description = `Don't miss to wish ${
            this.convertEventStringsToTitleAndType(event.name, event.eventType)
              .eventTitle
          } a lifetime of love and happiness!`;
        } else if (event.eventType === 'FAREWELL') {
          title = `Today is ${event.name} 😥`;
          description = `Don't miss to wish ${
            this.convertEventStringsToTitleAndType(event.name, event.eventType)
              .eventTitle
          } luck in his new journey!`;
        }
        await Promise.all([
          pushNotificationService.notificationsTrigger(
            { title, description },
            user.id.toString(),
          ),
          this.notificationRepo.createOne({
            title,
            description,
            userId: user.id,
          }),
        ]);
      });
    });
  }

  async findMany(
    query: Prisma.NotificationWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.notificationRepo.findManyWithPagination(query, options);
  }
}

export const notificationService = new NotificationService(notificationRepo);
