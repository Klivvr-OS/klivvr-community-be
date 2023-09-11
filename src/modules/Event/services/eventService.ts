import { Prisma } from '@prisma/client';
import { eventRepo, EventRepo } from '../repos/eventRepo';
import { z } from 'zod';
import { CustomError } from '../../../middlewares';

export class EventService {
  constructor(private readonly eventRepo: EventRepo) {}

  readonly createEventSchema = z.object({
    name: z.string().trim().nonempty(),
    date: z.coerce.date(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    image: z.string().optional(),
    eventType: z.enum(['BIRTHDAY', 'ANNIVERSARY', 'WEDDING', 'FAREWELL']),
  });

  readonly updateEventSchema = z.object({
    name: z.string().trim().nonempty().optional(),
    eventType: z
      .enum(['BIRTHDAY', 'ANNIVERSARY', 'WEDDING', 'FAREWELL'])
      .optional(),
    Date: z.coerce.date().optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    image: z.string().optional(),
  });

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

  async createOne(args: Prisma.EventUncheckedCreateInput) {
    return await this.eventRepo.createOne(args);
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

  async updateOne(
    query: Prisma.EventWhereUniqueInput,
    args: Prisma.EventUpdateInput,
  ) {
    return await this.eventRepo.updateOne(query, args);
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

  async deleteOne(query: Prisma.EventWhereUniqueInput) {
    return await this.eventRepo.deleteOne(query);
  }
}

export const eventService = new EventService(eventRepo);
