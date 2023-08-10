import { type Request, Response, NextFunction } from 'express';
import { userService } from '../modules';
import { secretAccessKey } from '../config';
import { CustomError } from './errorHandling';

const authenticateUser = async (req: Request, next: NextFunction) => {
  try {
    const { accessToken } = req.cookies as { accessToken: string };
    const user = await userService.authenticateUser(
      accessToken,
      secretAccessKey,
    );
    if (user) {
      req.user = user;
      return user;
    } else {
      throw new CustomError('Unauthorized', 401);
    }
  } catch (err) {
    next(err);
  }
};

export const isAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  await authenticateUser(req, next);
  next();
};

export const isNominated = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const user = await authenticateUser(req, next);
  if (user?.nominated) {
    next();
  } else {
    next(new CustomError('User is not nominated', 401));
  }
};

export const verifyModerator = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const user = await authenticateUser(req, next);
  if (user?.Role === 'PICK_MODERATOR') {
    next();
  } else {
    next(new CustomError('User is not a Klivvr Pick Moderator', 401));
  }
};

export const verifyAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const user = await authenticateUser(req, next);
  if (user?.Role === 'ADMIN') {
    next();
  } else {
    next(new CustomError('User is not an Admin', 401));
  }
};
