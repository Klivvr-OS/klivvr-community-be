import { Prisma } from '@prisma/client';
import { eventRepo, EventRepo } from '../repos/eventRepo';
import { CustomError } from '../../../middlewares';

export class EventService {
  constructor(private readonly eventRepo: EventRepo) {}

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

  async findTodayEvents() {
    return await this.eventRepo.findTodayEvents();
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
