import { PrismaClient } from "@prisma/client";
import prisma from "../../../database/prisma/client";

export class HelloRepo {
  constructor(private prisma: PrismaClient) {}

  async create(message: string) {
    return await prisma.hello.create({
      data: {
        message,
      },
    });
  }

  async findAll() {
    return await prisma.hello.findMany();
  }
}

export const helloRepo = new HelloRepo(prisma);
