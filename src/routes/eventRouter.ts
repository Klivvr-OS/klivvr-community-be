import express from 'express';
import { endpoint } from '../core/endpoint';
import { isAuth } from '../middlewares';
import { requestQueryPaginationSchema } from '../helpers';
import { userService } from '../modules';

const router = express.Router();

router.get(
  '/',
  isAuth,
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const usersWithBirthdays = await userService.findUsersBirthday({
      pageNumber,
      pageSize,
    });

    const usersAnniversaries = await userService.findUsersAnniversary({
      pageNumber,
      pageSize,
    });

    res.status(200).json({ usersWithBirthdays, usersAnniversaries });
  }),
);

export default router;
