import { Request, Response, NextFunction } from 'express';
import { userService } from '../modules';
import { secretAccessKey } from '../config';
import { CustomError } from './errorHandling';

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.accessToken;
    const user = await userService.authenticateUser(token, secretAccessKey);
    if (user) {
      res.locals.user = user;
      next();
    } else {
      throw new CustomError('Unauthorized', 401);
    }
  } catch (err) {
    next(err);
  }
};
