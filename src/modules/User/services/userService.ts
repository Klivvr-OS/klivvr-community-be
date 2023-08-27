import { userRepo, type UserRepo } from '../repos/userRepo';
import { Prisma } from '@prisma/client';
import { sendingEmails } from '../../../mailers/sendEmail';
import { generateCode } from '../../../helpers/generateCode';
import { CustomError } from '../../../middlewares';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { secretAccessKey, secretRefreshKey } from '../../../config';
import { z } from 'zod';
import { sendGridSubject, sendGridText, sendGridHTML } from '../../../config';
import { PasswordService, expiryDate } from '../../../helpers';

const ACCESS_TOKEN_EXPIRY_TIME = '15m';
const REFRESH_TOKEN_EXPIRY_TIME = '1w';

export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  readonly createUserSchema = z
    .object({
      firstName: z
        .string()
        .min(3, { message: 'First name is too short' })
        .trim(),
      lastName: z.string().min(3, { message: 'Last name is too short' }).trim(),
      email: z
        .string()
        .email({ message: 'Invalid email' }) //todo add endWith/regex for klivvr emails
        .toLowerCase()
        .trim(),
      password: z.string().min(6, { message: 'Password is too short' }).trim(),
      image: z.string(),
    })
    .required();

  readonly verifyUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email' }).toLowerCase().trim(),
    verificationCode: z
      .string()
      .nonempty({ message: 'Verification code is required' })
      .trim(),
  });

  readonly loginUserSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().trim(),
  });

  readonly validateUpdateUserSchema = z.object({
    firstName: z
      .string()
      .min(3, { message: 'First name is too short' })
      .optional(),
    lastName: z
      .string()
      .min(3, { message: 'Last name is too short' })
      .optional(),
    image: z.string().optional(),
    phone: z
      .string()
      .regex(/^01[0-2,5]{1}[0-9]{8}$/, { message: 'Invalid phone number' })
      .optional(),
    birthdate: z.coerce.date().optional(),
    interests: z.array(z.string()).optional(),
    address: z.string().nonempty().optional(),
    aboutMe: z.string().nonempty().optional(),
    title: z.string().nonempty().optional(),
    favoriteClubs: z.array(z.string()).optional(),
    preferredFoods: z.array(z.string()).optional(),
    hobbies: z.array(z.string()).optional(),
    hiringDate: z.coerce.date().optional(),
  });

  readonly resendVerificationCodeSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
  });

  async createOne(args: Prisma.UserUncheckedCreateInput) {
    const existingUser = await this.userRepo.findOne({
      email: args.email,
    });
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
    await sendingEmails(
      {
        to: args.email,
        subject: sendGridSubject,
        text: sendGridText,
        html: sendGridHTML,
      },
      code,
    );
    if (createdUser == null) {
      throw new CustomError('Internal Server Error', 500);
    }
    return createdUser;
  }

  async findManyWithPagination(
    query: Prisma.UserWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.userRepo.findManyWithPagination(query, options);
  }

  async findOne(
    args: Prisma.UserWhereInput,
    options?: { select: Prisma.UserSelect },
  ) {
    return await this.userRepo.findOne(args, options);
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
    const accessToken = sign(
      { id: user.id, role: user.Role },
      secretAccessKey,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
      },
    );

    const refreshToken = sign(
      { id: user.id, role: user.Role },
      secretRefreshKey,
      {
        expiresIn: REFRESH_TOKEN_EXPIRY_TIME,
      },
    );

    const now = new Date();
    const accessTokenExpiryDate = new Date(
      now.getTime() + expiryDate(ACCESS_TOKEN_EXPIRY_TIME),
    );
    const refreshTokenExpiryDate = new Date(
      now.getTime() + expiryDate(REFRESH_TOKEN_EXPIRY_TIME),
    );

    return {
      user,
      accessToken,
      refreshToken,
      accessTokenExpiryDate,
      refreshTokenExpiryDate,
    };
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

    const now = new Date();
    const accessTokenExpiryDate = new Date(
      now.getTime() + expiryDate(ACCESS_TOKEN_EXPIRY_TIME),
    );

    return { accessToken, accessTokenExpiryDate };
  }

  async findUsersBirthday(options: { pageNumber: number; pageSize: number }) {
    return await this.userRepo.findUsersBirthday(options);
  }

  async findUsersAnniversary(options: {
    pageNumber: number;
    pageSize: number;
  }) {
    return await this.userRepo.findUsersAnniversaries(options);
  }

  async resendVerificationCode(args: { email: string }) {
    const user = await this.userRepo.findOne({ email: args.email });
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    if (user.isVerified) {
      throw new CustomError('Forbidden', 403);
    }
    const code = generateCode();
    await sendingEmails(
      {
        to: user.email,
        subject: sendGridSubject,
        text: sendGridText,
        html: sendGridHTML,
      },
      code,
    );
    return await this.userRepo.updateOne(
      { id: user.id },
      { verificationCode: code },
    );
  }
}

export const userService = new UserService(userRepo);
