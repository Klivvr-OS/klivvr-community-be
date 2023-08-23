import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';
import { paginate } from '../../../helpers';

export class UserRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async createOne(args: Prisma.UserUncheckedCreateInput) {
    return await this.prisma.user.create({ data: args });
  }

  async findManyWithPagination(
    query: Prisma.UserWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.prisma.user.findMany({
      where: query,
      ...paginate(options),
      orderBy: { createdAt: 'asc' },
      select: {
        firstName: true,
        lastName: true,
        image: true,
      },
    });
  }

  async findOne(
    query: Prisma.UserWhereInput,
    options?: { select: Prisma.UserSelect },
  ) {
    return await this.prisma.user.findFirst({ where: query, ...options });
  }

  async updateOne(
    query: Prisma.UserWhereUniqueInput,
    args: Prisma.UserUncheckedUpdateInput,
  ) {
    return await this.prisma.user.update({ where: query, data: args });
  }

  async findUsersBirthday(options: { pageNumber: number; pageSize: number }) {
    const { skip, take } = paginate(options);
    return await this.prisma.$queryRaw`
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
      END AS isBirthdayToday
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
  }

  async findUsersAnniversaries(options: {
    pageNumber: number;
    pageSize: number;
  }) {
    const { skip, take } = paginate(options);
    return await this.prisma.$queryRaw`
    SELECT
        concat("firstName", ' ', "lastName") as "name",
        date_part('year', age("hiringDate")) as "years",
        date_part('year', "hiringDate")||'-'||date_part('month', "hiringDate")||'-'||date_part('day', "hiringDate") as "inKlivvrSince",
        "image"
      FROM
        "User"
      WHERE
        date_part('month', "hiringDate") = date_part('month', current_date)
        AND
        date_part('day', "hiringDate") = date_part('day', current_date)
      Order by
        "inKlivvrSince" DESC
      LIMIT
        ${take}
      OFFSET
        ${skip}
    `;
  }
}

export const userRepo = new UserRepo(prisma);
