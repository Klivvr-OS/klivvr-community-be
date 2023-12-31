import { Prisma, PrismaClient, Event } from '@prisma/client';
import { paginate } from '../../../helpers';
import prisma from '../../../database/client';

export class EventRepo {
  constructor(private readonly client: PrismaClient) {}

  async findOne(
    query: Prisma.EventWhereUniqueInput,
    options?: { select: Prisma.EventSelect },
  ) {
    return await this.client.event.findFirst({ where: query, ...options });
  }

  async findThisWeekEvents(options: { pageNumber: number; pageSize: number }) {
    const { skip, take } = paginate(options);
    return await this.client.$queryRaw`
        SELECT
            "id",
            "name",
            "image",
            "type",
            "userId",
            TO_CHAR("date", 'YYYY-MM-DD') AS "date"
        FROM
            "Event" 
        WHERE
            DATE_PART('month', "date") = DATE_PART('month', CURRENT_DATE)
            AND
            DATE_PART('day', "date") = DATE_PART('day', CURRENT_DATE)
            OR 
            date(DATE_PART('year', CURRENT_DATE)||'-'||DATE_PART('month', "date")||'-'||DATE_PART('day', "date")) BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '7 days'
        LIMIT
            ${take}
        OFFSET
            ${skip}
    `;
  }

  async findTodayEvents(): Promise<Event[]> {
    return await this.client.$queryRaw`
        SELECT
            "id",
            "name",
            "image",
            "type",
            "userId",
            TO_CHAR("date", 'YYYY-MM-DD') AS "date"
        FROM
            "Event" 
        WHERE
            DATE_PART('month', "date") = DATE_PART('month', CURRENT_DATE)
            AND
            DATE_PART('day', "date") = DATE_PART('day', CURRENT_DATE)
    `;
  }

  async upsertOne(
    query: Prisma.EventWhereUniqueInput,
    options: {
      create: Prisma.EventUncheckedCreateInput;
      update: Prisma.EventUncheckedUpdateInput;
    },
  ) {
    return await this.client.event.upsert({
      where: query,
      create: options.create,
      update: options.update,
    });
  }
}

export const eventRepo = new EventRepo(prisma);
