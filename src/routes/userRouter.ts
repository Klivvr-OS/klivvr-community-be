import express from 'express';
import { userService } from '../modules';
import { endpoint } from '../core/endpoint';
import { CustomError, isAuth } from '../middlewares';
import { requestQueryPaginationSchema } from '../helpers';

const router = express.Router();

router.get(
  '/',
  isAuth,
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const postObjects = await userService.findManyWithPagination(
      {},
      { pageNumber, pageSize },
    );
    if (!postObjects) {
      throw new CustomError('Posts not found', 404);
    }
    res.status(200).json(postObjects);
  }),
);

router.get(
  '/:id',
  isAuth,
  endpoint(async (req, res) => {
    const userId = Number(req.params.id);
    const userObject = await userService.findOneById({ id: userId });
    if (!userObject) {
      throw new CustomError('User not found', 404);
    }
    res.status(200).json(userObject);
  }),
);

export default router;
