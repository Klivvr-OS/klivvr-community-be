import { type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';
import { type User } from '../types/register';

export class UserRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async createOne({
    firstName,
    lastName,
    email,
    password,
  }: User): Promise<any> {
    return await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
      },
    });
  }

  async findOneByEmail(email: string): Promise<any> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async updateOne(email: string, verificationCode: string): Promise<any> {
    return await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        verificationCode,
      },
    });
  }
}

export const userRepo = new UserRepo(prisma);
