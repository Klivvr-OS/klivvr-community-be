import { Prisma } from '@prisma/client';
import {
  klivvrPickNomineeRepo,
  KlivvrPickNomineeRepo,
} from '../repos/klivvrPickNomineeRepo';
import { CustomError } from '../../../middlewares';

export class KlivvrPickNomineeService {
  constructor(private readonly klivvrPickNomineeRepo: KlivvrPickNomineeRepo) {}

  async createOne(args: Prisma.KlivvrPickNomineeUncheckedCreateInput) {
    return await this.klivvrPickNomineeRepo.createOne(args);
  }

  async findOne(
    query: Prisma.KlivvrPickNomineeWhereUniqueInput,
    options?: { select: Prisma.KlivvrPickNomineeSelect },
  ) {
    return await this.klivvrPickNomineeRepo.findOne(query, options);
  }

  async findMany() {
    return await this.klivvrPickNomineeRepo.findMany();
  }

  async updateOne(
    query: Prisma.KlivvrPickNomineeWhereUniqueInput,
    args: Prisma.KlivvrPickNomineeUpdateInput,
  ) {
    return await this.klivvrPickNomineeRepo.updateOne(query, args);
  }

  async upsertOne(
    nomineeId: number,
    nominatorId: number,
    startDate: Date,
    endDate: Date,
  ) {
    return await this.klivvrPickNomineeRepo.upsertOne(
      nomineeId,
      nominatorId,
      startDate,
      endDate,
    );
  }

  async deleteOne(query: Prisma.KlivvrPickNomineeWhereUniqueInput) {
    return await this.klivvrPickNomineeRepo.deleteOne(query);
  }

  getThisWeekRange() {
    const currentDate = new Date();
    let daysFromLastThursday = currentDate.getDay() - 4;
    if (daysFromLastThursday < 0) daysFromLastThursday += 7;

    const lastThursday = new Date(currentDate);
    lastThursday.setDate(currentDate.getDate() - daysFromLastThursday);
    lastThursday.setHours(0, 0, 0, 0);

    const thisWednesday = new Date(lastThursday);
    thisWednesday.setDate(lastThursday.getDate() + 6);
    thisWednesday.setHours(23, 59, 59, 999);

    return { start: lastThursday, end: thisWednesday };
  }

  async getNomineeForDateRange(start: Date, end: Date) {
    const user = await this.klivvrPickNomineeRepo.findOne({
      startDate: { gte: start },
      endDate: { lte: end },
    });
    return user;
  }

  async isNominated(nomineeId: number) {
    const { start, end } = this.getThisWeekRange();
    const user = await this.getNomineeForDateRange(start, end);
    return user?.nomineeId === nomineeId;
  }

  async nominate(nomineeId: number, nominatorId: number) {
    const { start, end } = this.getThisWeekRange();
    const today = new Date();
    const startDate = today;
    const daysUntilWednesday = (3 - today.getDay() + 7) % 7;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysUntilWednesday);
    const existingNominee = await this.getNomineeForDateRange(start, end);
    if (existingNominee)
      throw new CustomError('There is Already a Nominee', 403);
    return await this.upsertOne(nomineeId, nominatorId, startDate, endDate);
  }
}

export const klivvrPickNomineeService = new KlivvrPickNomineeService(
  klivvrPickNomineeRepo,
);
