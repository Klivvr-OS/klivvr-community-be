import { userRepo, type UserRepo } from '../repos/userRepo';
import { type User } from '../types/register';
import { type Request } from 'express';
import sendGridEmail from '../../../mailers/sendEmail';
import { generateVerificationCode } from '../../../helpers/verificationCode';
import Joi from 'joi';

export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  private async validateUserData(req: Request): Promise<any> {
    const schema = Joi.object({
      firstName: Joi.string().min(3).max(30).required(),
      lastName: Joi.string().min(3).max(30).required(),
      email: Joi.string()
        .regex(/^[A-Za-z0-9._%+-]+@klivvr\.com$/)
        .required()
        .messages({
          'string.pattern.base': `Email must be a valid Klivvr email`,
        }),
      password: Joi.string().min(8).max(30).required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    });

    try {
      await schema.validateAsync(req.body);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async createOne(req: Request): Promise<any> {
    await this.validateUserData(req);

    try {
      const { firstName, lastName, email, password } = req.body;
      const user: User = {
        firstName,
        lastName,
        email,
        password,
      };
      const existingUser: boolean = await this.userRepo.findOneByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      const createdUser = await this.userRepo.createOne(user);
      const code: string = await generateVerificationCode();
      await sendGridEmail(
        createdUser.email,
        'Welcome to Klivvr',
        'Welcome to Klivvr',
        `<h1>Welcome to Klivvr</h1><p>Thank you for registering with Klivvr. Here is your verification code ${code},
        `,
      );
      createdUser.verifyCode = code;
      await this.userRepo.updateOne(createdUser.email, createdUser.verifyCode);
      return createdUser;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async findOneByEmail(email: string): Promise<any> {
    try {
      const user = await this.userRepo.findOneByEmail(email);
      return user;
    } catch (error: any) {
      throw new Error(error);
    }
  }
}

export const userService = new UserService(userRepo);
