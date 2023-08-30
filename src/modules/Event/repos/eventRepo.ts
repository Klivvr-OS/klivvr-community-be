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

    const Birthdays = await this.client.$queryRaw`
        SELECT 
            concat("firstName", ' ', "lastName") as "name",
            date_part('year', birthdate)||'-'||date_part('month', birthdate)||'-'||date_part('day', birthdate) as "birthdate",
            "image",
            CASE
                WHEN 
                    (DATE_PART('month', "birthdate") = DATE_PART('month', CURRENT_DATE)
                    AND
                    DATE_PART('day', "birthdate") = DATE_PART('day', CURRENT_DATE))
                THEN
                    true
                ELSE 
                    false
            END AS isToday,
          'BIRTHDAY' as "eventType"
        FROM 
            "User" 
        WHERE 
            date(date_part('year', current_date)||'-'||date_part('month', birthdate)||'-'||date_part('day', birthdate)) BETWEEN current_date AND current_date + interval '7 days'
        Order by 
            "birthdate" DESC
        LIMIT
            ${take}
        OFFSET
            ${skip}
    `;

    const Anniversaries = await this.client.$queryRaw`
        SELECT
            concat("firstName", ' ', "lastName") as "name",
            date_part('year', age("hiringDate")) as "years",
            date_part('year', "hiringDate")||'-'||date_part('month', "hiringDate")||'-'||date_part('day', "hiringDate") as "inKlivvrSince",
            "image",
            CASE
                WHEN 
                    (DATE_PART('month', "hiringDate") = DATE_PART('month', CURRENT_DATE)
                    AND
                    DATE_PART('day', "hiringDate") = DATE_PART('day', CURRENT_DATE))
                THEN
                    true
                ELSE 
                    false
            END AS isToday,
            'ANNIVERSARY' as "eventType"
        FROM
            "User"
        WHERE
            date_part('month', "hiringDate") = date_part('month', current_date)
            AND
            date_part('day', "hiringDate") = date_part('day', current_date)
            OR 
            date(date_part('year', current_date)||'-'||date_part('month', "hiringDate")||'-'||date_part('day', "hiringDate")) BETWEEN current_date AND current_date + interval '7 days'
        Order by
            "inKlivvrSince" DESC
        LIMIT
            ${take}
        OFFSET
            ${skip}
    `;

    const Events = await this.client.$queryRaw`
        SELECT
            "name",
            "image",
            "startTime",
            "endTime",
            "date",
            "eventType",
            CASE
                WHEN 
                    (DATE_PART('month', "date") = DATE_PART('month', CURRENT_DATE)
                    AND
                    DATE_PART('day', "date") = DATE_PART('day', CURRENT_DATE))
                THEN
                    true
                ELSE 
                    false
            END AS isEventToday
        FROM
            "Event"
        WHERE
            date(date_part('year', current_date)||'-'||date_part('month', "date")||'-'||date_part('day', "date")) BETWEEN current_date AND current_date + interval '7 days'
        ORDER BY
            "startTime" ASC
        LIMIT 
            ${take} 
        OFFSET 
            ${skip}
    `;

    return {
      Birthdays,
      Anniversaries,
      Events,
    };
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
