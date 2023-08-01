import { type Request, Response, NextFunction } from 'express';
import { userService } from '../modules';
import { secretAccessKey } from '../config';
import { CustomError } from './errorHandling';

export const isAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken } = req.cookies as { accessToken: string };
    const user = await userService.authenticateUser(
      accessToken,
      secretAccessKey,
    );
    if (user) {
      req.user = user;
      next();
    } else {
      throw new CustomError('Unauthorized', 401);
    }
  } catch (err) {
    next(err);
  }
};
