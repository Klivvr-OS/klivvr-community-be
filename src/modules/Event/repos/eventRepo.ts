import { Prisma, PrismaClient } from '@prisma/client';
import { paginate } from '../../../helpers';
import prisma from '../../../database/client';

export class EventRepo {
  constructor(private readonly client: PrismaClient) {}

  async createOne(args: Prisma.EventUncheckedCreateInput) {
    return await this.client.event.create({ data: args });
  }

  async findManyWithPagination(
    query: Prisma.EventWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.client.event.findMany({
      where: query,
      ...paginate(options),
    });
  }

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
            "startTime",
            "endTime",
            "image",
            "eventType",
            "userId",
            TO_CHAR("date", 'YYYY-MM-DD') AS "date"
        FROM
            "Event" 
        WHERE
            DATE_PART('month', "date") = DATE_PART('month', current_date)
            AND
            DATE_PART('day', "date") = DATE_PART('day', current_date)
            OR 
            date(DATE_PART('year', current_date)||'-'||DATE_PART('month', "date")||'-'||DATE_PART('day', "date")) BETWEEN current_date AND current_date + interval '7 days'
        LIMIT
            ${take}
        OFFSET
            ${skip}
    `;
  }

  async findManyByUserId(
    query: { userId: number },
    options?: { select: Prisma.EventSelect },
  ) {
    return await this.client.event.findMany({
      where: { userId: query.userId },
      ...options,
    });
  }

  async updateOne(
    query: Prisma.EventWhereUniqueInput,
    args: Prisma.EventUpdateInput,
  ) {
    return await this.client.event.update({ where: query, data: args });
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

  async deleteOne(query: Prisma.EventWhereUniqueInput) {
    return await this.client.event.delete({ where: query });
  }
}

export const eventRepo = new EventRepo(prisma);
