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

  async findEvents(options: { pageNumber: number; pageSize: number }) {
    const { skip, take } = paginate(options);

    return await this.client.$queryRaw`
        SELECT
            "id",
            "name",
            "startTime",
            "endTime",
            "image",
            "eventType",
            Date_part('year', current_date) || '-' || Date_part('month', "date") || '-' || Date_part('day', "date") AS "date"
        FROM
            "Event" 
        WHERE
            date_part('month', "date") = date_part('month', current_date)
            AND
            date_part('day', "date") = date_part('day', current_date)
            OR 
            date(date_part('year', current_date)||'-'||date_part('month', "date")||'-'||date_part('day', "date")) BETWEEN current_date AND current_date + interval '7 days'
        LIMIT
            ${take}
        OFFSET
            ${skip}
    `;
  }

  async findEventByUser(
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

  async deleteOne(query: Prisma.EventWhereUniqueInput) {
    return await this.client.event.delete({ where: query });
  }
}

export const eventRepo = new EventRepo(prisma);
