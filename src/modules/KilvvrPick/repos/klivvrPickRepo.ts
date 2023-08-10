import { Prisma, PrismaClient } from '@prisma/client';
import { paginate } from '../../../helpers';
import prisma from '../../../database/client';

export class KlivvrPickRepo {
  constructor(private readonly client: PrismaClient) {}

  async createOne(args: Prisma.KlivvrPickUncheckedCreateInput) {
    return await this.client.klivvrPick.create({ data: args });
  }

  async findManyWithPagination(
    query: Prisma.KlivvrPickWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.client.klivvrPick.findMany({
      where: query,
      ...paginate(options),
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        description: true,
        link: true,
        category: true,
        photoURL: true,
        userId: true,
      },
    });
  }

  async findOne(
    query: Prisma.KlivvrPickWhereUniqueInput,
    options?: { select: Prisma.KlivvrPickSelect },
  ) {
    return await this.client.klivvrPick.findFirst({ where: query, ...options });
  }

  async findThisWeeksPick(options: { pageNumber: number; pageSize: number }) {
    const { skip, take } = paginate(options);
    return await this.client.$queryRaw`
    SELECT
        "name",
        "description",
        "link",
        "category",
        "photoURL",
        date_part('year', "createdAt") || '-' || date_part('month', "createdAt") || '-' || date_part('day', "createdAt") AS "Klivvr Pick Date"
    FROM
        "KlivvrPick"
    WHERE
        "createdAt" BETWEEN 
            CASE 
                WHEN EXTRACT(DOW FROM current_date)::integer = 4 THEN current_date 
                ELSE current_date - (EXTRACT(DOW FROM current_date)::integer + 3) % 7 
            END 
        AND 
            CASE 
                WHEN EXTRACT(DOW FROM current_date)::integer = 4 THEN current_date 
                ELSE current_date - (EXTRACT(DOW FROM current_date)::integer + 3) % 7
            END + interval '7 days';
    LIMIT
      ${take}
    OFFSET
      ${skip}
    `;
  }

  async updateOne(
    query: Prisma.KlivvrPickWhereUniqueInput,
    args: Prisma.KlivvrPickUpdateInput,
  ) {
    return await this.client.klivvrPick.update({ where: query, data: args });
  }

  async deleteOne(query: Prisma.KlivvrPickWhereUniqueInput) {
    return await this.client.klivvrPick.delete({ where: query });
  }
}

export const klivvrPickRepo = new KlivvrPickRepo(prisma);
