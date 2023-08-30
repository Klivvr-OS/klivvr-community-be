import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../../../database/client';
import { paginate } from '../../../helpers';

export class NotificationRepo {
  constructor(private readonly client: PrismaClient) {}

  async createOne(args: Prisma.NotificationUncheckedCreateInput) {
    return await this.client.notification.create({ data: args });
  }

  async findManyWithPagination(
    query: Prisma.NotificationWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.client.notification.findMany({
      where: query,
      ...paginate(options),
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const notificationRepo = new NotificationRepo(prisma);
