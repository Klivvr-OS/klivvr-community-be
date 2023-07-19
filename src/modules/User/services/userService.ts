import { userRepo, type UserRepo } from '../repos/userRepo';
import { Prisma } from '@prisma/client';
import sendGridEmail from '../../../mailers/sendEmail';
import { generateVerificationCode } from '../../../helpers/verificationCode';
import { CustomError } from '../../../middlewares';

export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  async createOne(args: Prisma.UserUncheckedCreateInput) {
    const existingUser = await this.userRepo.findOne({
      email: args.email,
    });
    if (existingUser != null) {
      throw new CustomError('User already exists', 409);
    }
    const code = generateVerificationCode();
    const createdUser = await this.userRepo.createOne({
      ...args,
      verificationCode: code,
    });
    await sendGridEmail(
      createdUser.email,
      'Welcome to Klivvr',
      `Welcome to Klivvr Thank you for registering with Klivvr. Here is your verification code ${code}`,
      `<h1>Welcome to Klivvr</h1><p>Thank you for registering with Klivvr. Here is your verification code ${code}</p>`,
    );
    return createdUser;
  }

  async findOne(args: Prisma.UserWhereInput) {
    return await this.userRepo.findOne({ email: args.email });
  }
}

export const userService = new UserService(userRepo);
