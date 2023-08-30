import { Prisma } from '@prisma/client';
import { eventRepo, EventRepo } from '../repos/eventRepo';
import { z } from 'zod';
import { CustomError } from '../../../middlewares';

export class EventService {
  constructor(private readonly eventRepo: EventRepo) {}

  readonly createEventSchema = z.object({
    name: z.string().trim().nonempty(),
    date: z.coerce.date(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
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

  async findEvents(options: { pageNumber: number; pageSize: number }) {
    return await this.eventRepo.findEvents(options);
  }

  async findEventByUser(
    query: { userId: number },
    options?: { select: Prisma.EventSelect },
  ) {
    return await this.eventRepo.findEventByUser(query, options);
  }

  async updateOne(
    query: Prisma.EventWhereUniqueInput,
    args: Prisma.EventUpdateInput,
  ) {
    return await this.eventRepo.updateOne(query, args);
  }

  async deleteOne(query: Prisma.EventWhereUniqueInput) {
    return await this.eventRepo.deleteOne(query);
  }
}

export const eventService = new EventService(eventRepo);
