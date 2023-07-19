import express, { Request, Response } from 'express';
import { userService } from '../modules';
import { Prisma } from '@prisma/client';
import { endpoint } from '../core/endpoint';

const router = express.Router();

router.post(
  '/register',
  endpoint(async (req: Request, res: Response) => {
    const user = await userService.createOne(
      req.body as Prisma.UserUncheckedCreateInput,
    );
    if (user != null) {
      res.status(201).json({
        message:
          'User created successfully, Please check your email for verification code',
      });
    }
  }),
);

export default router;
