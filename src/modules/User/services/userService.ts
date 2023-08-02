import { userRepo, type UserRepo } from '../repos/userRepo';
import { Prisma } from '@prisma/client';
import sendGridEmail from '../../../mailers/sendEmail';
import { generateCode } from '../../../helpers/generateCode';
import { CustomError } from '../../../middlewares';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { secretAccessKey, secretRefreshKey } from '../../../config';
import { z } from 'zod';
import { sendGridSubject, sendGridText, sendGridHTML } from '../../../config';
import { PasswordService } from '../../../helpers';

const ACCESS_TOKEN_EXPIRY_TIME = '30s';
const REFRESH_TOKEN_EXPIRY_TIME = '1w';

export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  createUserSchema = z
    .object({
      firstName: z
        .string()
        .min(3, { message: 'First name is too short' })
        .trim(),
      lastName: z.string().min(3, { message: 'Last name is too short' }).trim(),
      email: z
        .string()
        .email({ message: 'Invalid email' })
        .toLowerCase()
        .trim(),
      password: z.string().min(6, { message: 'Password is too short' }).trim(),
      photoURL: z.string(),
    })
    .required();

  verifyUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email' }).toLowerCase().trim(),
    verificationCode: z
      .string()
      .nonempty({ message: 'Verification code is required' })
      .trim(),
  });

  loginUserSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().trim(),
  });

  validateUpdateUserSchema = z.object({
    firstName: z
      .string()
      .min(3, { message: 'First name is too short' })
      .optional(),
    lastName: z
      .string()
      .min(3, { message: 'Last name is too short' })
      .optional(),
    photoURL: z.string().optional(),
    phone: z
      .string()
      .regex(/^01[0-2,5]{1}[0-9]{8}$/, { message: 'Invalid phone number' })
      .optional(),
    birthdate: z.coerce.date().optional(),
    likes: z.array(z.string()).optional(),
    favoriteClubs: z.array(z.string()).optional(),
    preferredFoods: z.array(z.string()).optional(),
    hobbies: z.array(z.string()).optional(),
  });

  async createOne(args: Prisma.UserUncheckedCreateInput) {
    const existingUser = await this.userRepo.findOne({ email: args.email });
    if (existingUser != null) {
      throw new CustomError('User already exists', 409);
    }
    const code = generateCode();
    const hashedPassword = await PasswordService.hashPassword(args.password);
    const createdUser = await this.userRepo.createOne({
      ...args,
      password: hashedPassword,
      verificationCode: code,
    });
    await sendGridEmail(
      createdUser.email,
      sendGridSubject,
      sendGridText,
      `${sendGridHTML}<br><p>Your verification code is: <strong>${code}</strong></p>`,
    );
    if (createdUser == null) {
      throw new CustomError('Internal Server Error', 500);
    }
    return createdUser;
  }

  async findOne(args: Prisma.UserWhereInput) {
    return await this.userRepo.findOne({ email: args.email });
  }

  async updateOne(
    query: Prisma.UserWhereUniqueInput,
    args: Prisma.UserUncheckedUpdateInput,
  ) {
    return await this.userRepo.updateOne(query, args);
  }

  async checkVerificationCode(args: Prisma.UserWhereInput) {
    const user = await this.userRepo.findOne({ email: args.email });
    if (!user) {
      throw new CustomError('Invalid Credentials', 401);
    }
    const id = user.id;
    if (user.isVerified) {
      throw new CustomError('Invalid Credentials', 401);
    }
    if (user.verificationCode != args.verificationCode) {
      throw new CustomError('Invalid Credentials', 401);
    }
    return await this.userRepo.updateOne(
      { id },
      { isVerified: true, verificationCode: null },
    );
  }

  async login(args: { email: string; password: string }) {
    const user = await this.userRepo.findOne({ email: args.email });
    if (!user?.isVerified) {
      throw new CustomError('Invalid Credentials', 401);
    }

    const isPasswordCorrect = await PasswordService.comparePasswords(
      args.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new CustomError('Invalid Credentials', 401);
    }
    const accessToken = sign({ id: user.id }, secretAccessKey, {
      expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
    });

    const refreshToken = sign({ id: user.id }, secretRefreshKey, {
      expiresIn: REFRESH_TOKEN_EXPIRY_TIME,
    });

    return { user, accessToken, refreshToken };
  }

  async authenticateUser(token: string, secret: string) {
    let payload;
    try {
      payload = verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new CustomError('Invalid token', 401);
    }
    let user;
    if (typeof payload.id === 'number') {
      user = await this.userRepo.findOne({ id: payload.id });
    }
    if (!user) {
      throw new CustomError('Invalid token', 401);
    }
    return user;
  }

  verifyRefreshToken(token: string, secret: string) {
    let payload;
    try {
      payload = verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new CustomError('Invalid token', 401);
    }

    if (!payload) {
      throw new CustomError('Invalid token', 401);
    }
    let accessToken;
    if (typeof payload.id === 'number') {
      accessToken = sign({ id: payload.id }, secretAccessKey, {
        expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
      });
    }

    return accessToken;
  }
}

export const userService = new UserService(userRepo);
