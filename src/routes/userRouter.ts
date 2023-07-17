import express, { type Request, type Response } from 'express';
import { userService } from '../modules';
import { type User } from '../modules/User/types/register';

const router = express.Router();

router.post('/register', (req: Request, res: Response): any => {
  userService
    .createOne(req)
    .then((user: User) => {
      return res.status(201).json({
        message: 'User created successfully',
        userData: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    })
    .catch((e: any) => {
      return res.status(500).json({
        message: e?.message ?? 'Internal Server Error',
      });
    });
});

export default router;
