import express from 'express';
import { endpoint } from '../core/endpoint';
import { notificationService } from '../modules';
import { requestQueryPaginationSchema } from '../helpers';

const router = express.Router();

router.get(
  '/',
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const userId = req.user?.id;
    const notifications = await notificationService.findManyWithPagination(
      {
        userId,
      },
      { pageNumber, pageSize },
    );
    if (!notifications) {
      res.status(404).json({ message: 'Notifications not found' });
    }
    res.status(200).json({ notifications });
  }),
);

export default router;
