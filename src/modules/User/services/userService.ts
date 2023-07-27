import { userRepo, type UserRepo } from '../repos/userRepo';
import { Prisma } from '@prisma/client';
import sendGridEmail from '../../../mailers/sendEmail';
import { generateVerificationCode } from '../../../helpers/verificationCode';
import { CustomError } from '../../../middlewares';
import bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { secretAccessKey, secretRefreshKey } from '../../../config';

const ACCESS_TOKEN_EXPIRY_TIME = '30s';
const REFRESH_TOKEN_EXPIRY_TIME = '1w';

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
    const hashedPassword = await bcrypt.hash(args.password, 12);
    const createdUser = await this.userRepo.createOne({
      ...args,
      password: hashedPassword,
      verificationCode: code,
    });
    await sendGridEmail(
      createdUser.email,
      'Welcome to Klivvr',
      `Welcome to Klivvr Thank you for registering with Klivvr. Here is your verification code ${code}`,
      `<h1>Welcome to Klivvr</h1><p>Thank you for registering with Klivvr. Here is your verification code ${code}</p>`,
    );
    if (createdUser == null) {
      throw new CustomError('Internal Server Error', 500);
    }
    return createdUser;
  }

  async findOne(args: Prisma.UserWhereInput) {
    return await this.userRepo.findOne({ email: args.email });
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
      {
        isVerified: true,
      },
    );
  }

  async login(args: Prisma.UserWhereInput) {
    const user = await this.userRepo.findOne({ email: args.email });
    const password = String(args.password);
    if (!user || !user.isVerified) {
      throw new CustomError('Invalid Credentials', 401);
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new CustomError('Invalid Credentials', 401);
    }
    const accessToken = sign(
      {
        id: user.id,
      },
      secretAccessKey,
      { expiresIn: ACCESS_TOKEN_EXPIRY_TIME },
    );

    const refreshToken = sign(
      {
        id: user.id,
      },
      secretRefreshKey,
      { expiresIn: REFRESH_TOKEN_EXPIRY_TIME },
    );

    return { user, accessToken, refreshToken };
  }

  async authenticateUser(token: string, secret: string) {
    let payload: any;
    try {
      payload = verify(token, secret);
    } catch (error) {
      throw new CustomError('Invalid token', 401);
    }
    if (!payload) {
      throw new CustomError('Invalid token', 401);
    }
    const user = await this.userRepo.findOne({ id: payload.id });
    if (!user) {
      throw new CustomError('Invalid token', 401);
    }
    return user;
  }

  async verifyRefreshToken(token: string, secret: string) {
    let payload: any;
    try {
      payload = verify(token, secret);
    } catch (error) {
      throw new CustomError('Invalid token', 401);
    }

    if (!payload) {
      throw new CustomError('Invalid token', 401);
    }

    const accessToken = sign({ id: payload.id }, secretAccessKey, {
      expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
    });

    return accessToken;
  }
}

export const userService = new UserService(userRepo);
