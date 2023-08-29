import express from 'express';
import { endpoint } from '../core/endpoint';
import { notificationService } from '../modules';
import { requestQueryPaginationSchema } from '../helpers';

const router = express.Router();

router.post(
  '/',
  endpoint(async (req, res) => {
    const notification = notificationService.createNotificationSchema.parse(
      req.body,
    );
    const userId = req.user?.id;
    await notificationService.createOne({
      ...notification,
      userId: userId as number,
    });
    res.status(201).json({ message: 'Notification created successfully' });
  }),
);

router.get(
  '/',
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const userId = req.user?.id;
    const notifications = await notificationService.findMany(
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
