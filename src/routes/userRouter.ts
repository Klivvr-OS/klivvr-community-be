import express, { type Request, type Response } from 'express';
import { userService } from '../modules';
import { type User as UserType } from '@prisma/client';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const user: UserType = await userService.createOne(req);
    return res.status(201).json({
      message: 'User created successfully',
      userData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (e: any) {
    return res.status(e?.status ?? 500).json({
      message: e?.message ?? 'Internal Server Error',
    });
  }
});

export default router;
