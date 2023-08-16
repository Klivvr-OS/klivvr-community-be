import express from 'express';
import { endpoint } from '../core/endpoint';
import { requestQueryPaginationSchema } from '../helpers';
import { userService } from '../modules';

const router = express.Router();

router.get(
  '/',
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );

    const [usersWithBirthdays, usersAnniversaries] = await Promise.all([
      userService.findUsersBirthday({ pageNumber, pageSize }),
      userService.findUsersAnniversary({ pageNumber, pageSize }),
    ]);

    res.status(200).json({ usersWithBirthdays, usersAnniversaries });
  }),
);

export default router;
