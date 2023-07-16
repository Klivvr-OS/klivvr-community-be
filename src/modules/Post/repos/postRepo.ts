import { type PrismaClient } from '@prisma/client';
import prisma from '../../../database/prisma/client';

export class PostRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async createOne(description: string, photoURL: string, userId: number) {
    return await prisma.post.create({
      data: {
        description,
        photoURL,
        userId,
      },
    });
  }

  async findMany() {
    return await prisma.post.findMany();
  }

  async findOne(id: number) {
    return await prisma.post.findUnique({
      where: {
        id,
      },
    });
  }
}

export const postRepo = new PostRepo(prisma);
