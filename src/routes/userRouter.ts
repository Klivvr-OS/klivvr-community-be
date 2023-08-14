import express from 'express';
import { userService } from '../modules';
import { endpoint } from '../core/endpoint';
import { CustomError, isAuth } from '../middlewares';
import { requestQueryPaginationSchema } from '../helpers';
import { klivvrPickService } from '../modules/KilvvrPick';

const router = express.Router();

router.get(
  '/',
  isAuth,
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const users = await userService.findManyWithPagination(
      {},
      { pageNumber, pageSize },
    );
    res.status(200).json(users);
  }),
);

router.get(
  '/:id',
  isAuth,
  endpoint(async (req, res) => {
    const userId = Number(req.params.id);
    const klivvrPicks = await klivvrPickService.findPickByUser(
      { userId },
      {
        select: {
          name: true,
          description: true,
          link: true,
          category: true,
          photoURL: true,
        },
      },
    );
    const userObject = await userService.findOne(
      { id: userId },
      {
        select: {
          firstName: true,
          lastName: true,
          photoURL: true,
          phone: true,
          hobbies: true,
          birthdate: true,
          email: true,
          likes: true,
          preferredFoods: true,
          favoriteClubs: true,
        },
      },
    );
    if (!userObject) {
      throw new CustomError('User not found', 404);
    }
    res.status(200).json({ userObject, klivvrPicks });
  }),
);

export default router;
