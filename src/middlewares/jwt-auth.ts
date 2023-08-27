import { type Request, Response, NextFunction } from 'express';
import { userService } from '../modules';
import { secretAccessKey } from '../config';
import { CustomError } from './errorHandling';
import { klivvrPickNomineeService } from '../modules/KlivvrPickNominee';
import { User } from '@prisma/client';

export const isAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) throw new CustomError('Unauthorized', 401);
    const user = await userService.authenticateUser(
      accessToken,
      secretAccessKey,
    );
    if (user) req.user = user;
    else throw new CustomError('Unauthorized', 401);
    next();
  } catch (err) {
    next(err);
  }
};

export const isNominated = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const nominated = await klivvrPickNomineeService.isNominated(
    req.user?.id as number,
  );
  if (nominated) {
    next();
  } else {
    next(new CustomError('User is not nominated', 401));
  }
};

export const verifyModerator = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const user = req.user as User;
  if (user.Role === 'PICK_MODERATOR') {
    next();
  } else {
    next(new CustomError('User is not a Klivvr Pick Moderator', 401));
  }
};
