import { userRepo, type UserRepo } from '../repos/userRepo';
import { type User as UserType } from '@prisma/client';
import { type User } from '../types/register';
import { type Request } from 'express';
import sendGridEmail from '../../../mailers/sendEmail';
import { generateVerificationCode } from '../../../helpers/verificationCode';
import { ErrorFactory } from '../../../helpers/errorFactory';
import Joi from 'joi';

export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  private async validateUserData(req: Request): Promise<UserType> {
    const regex = /^[A-Za-z0-9._%+-]+@klivvr\.com$/;
    const schema = Joi.object({
      firstName: Joi.string().min(3).max(30).trim().required().messages({
        'string.pattern.base': `First name must be at least 3 characters long`,
      }),
      lastName: Joi.string().min(3).max(30).trim().required().messages({
        'string.pattern.base': `Last name must be at least 3 characters long`,
      }),
      email: Joi.string().regex(regex).lowercase().trim().required().messages({
        'string.pattern.base': `Email must be a valid Klivvr email`,
      }),
      password: Joi.string().min(8).max(30).trim().required().messages({
        'string.pattern.base': `Password must be at least 8 characters long`,
      }),
    });

    try {
      return await schema.validateAsync(req.body);
    } catch (error: any) {
      throw new ErrorFactory(error.message, 400);
    }
  }

  async createOne(req: Request): Promise<UserType> {
    const validatedData: UserType = await this.validateUserData(req);

    try {
      const { firstName, lastName, email, password } = validatedData;
      const user: User = {
        firstName,
        lastName,
        email,
        password,
      };
      const existingUser = await this.userRepo.findOneByEmail(email);
      if (existingUser != null) {
        throw new Error('User already exists');
      }
      const createdUser = await this.userRepo.createOne(user);
      const code: string = generateVerificationCode();
      await sendGridEmail(
        createdUser.email,
        'Welcome to Klivvr',
        'Welcome to Klivvr',
        `<h1>Welcome to Klivvr</h1><p>Thank you for registering with Klivvr. Here is your verification code ${code},
        `,
      );
      createdUser.verificationCode = code;
      await this.userRepo.updateOne(
        createdUser.email,
        createdUser.verificationCode,
      );
      return createdUser;
    } catch (error: any) {
      throw new ErrorFactory(error.message, 409);
    }
  }

  async findOneByEmail(email: string): Promise<UserType | null> {
    try {
      const user = await this.userRepo.findOneByEmail(email);
      return user;
    } catch (error: any) {
      throw new ErrorFactory(error.message, 404);
    }
  }
}

export const userService = new UserService(userRepo);
