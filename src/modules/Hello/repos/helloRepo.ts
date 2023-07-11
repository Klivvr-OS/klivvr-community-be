import { type PrismaClient } from '@prisma/client';
import prisma from '../../../database/prisma/client';

export class HelloRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async createOne(message: string) {
    return await prisma.hello.create({
      data: {
        message,
      },
    });
  }

  async findMany() {
    return await prisma.hello.findMany();
  }
}

export const helloRepo = new HelloRepo(prisma);
