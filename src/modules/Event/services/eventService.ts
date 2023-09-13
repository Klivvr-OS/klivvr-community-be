import { Prisma } from '@prisma/client';
import { eventRepo, EventRepo } from '../repos/eventRepo';
import { CustomError } from '../../../middlewares';

export class EventService {
  constructor(private readonly eventRepo: EventRepo) {}

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

  async findManyWithPagination(
    query: Prisma.EventWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.eventRepo.findManyWithPagination(query, options);
  }

  async findOne(
    query: Prisma.EventWhereUniqueInput,
    options?: { select: Prisma.EventSelect },
  ) {
    return await this.eventRepo.findOne(query, options);
  }

  async findOneWithError(
    query: Prisma.EventWhereUniqueInput,
    options?: { select: Prisma.EventSelect },
  ) {
    const event = await this.eventRepo.findOne(query, options);
    if (!event) throw new CustomError('Event is Not Found', 404);
    return event;
  }

  async findThisWeekEvents(options: { pageNumber: number; pageSize: number }) {
    return await this.eventRepo.findThisWeekEvents(options);
  }

  async findManyByUserId(
    query: { userId: number },
    options?: { select: Prisma.EventSelect },
  ) {
    return await this.eventRepo.findManyByUserId(query, options);
  }

  async upsertOne(
    query: Prisma.EventWhereUniqueInput,
    options: {
      create: Prisma.EventUncheckedCreateInput;
      update: Prisma.EventUncheckedUpdateInput;
    },
  ) {
    return await this.eventRepo.upsertOne(query, options);
  }
}

export const eventService = new EventService(eventRepo);
