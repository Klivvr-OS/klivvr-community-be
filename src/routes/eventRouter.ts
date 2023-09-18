import express from 'express';
import { endpoint } from '../core/endpoint';
import { requestQueryPaginationSchema } from '../helpers';
import { eventService } from '../modules/Event';

const router = express.Router();

router.get(
  '/',
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const events = await eventService.findThisWeekEvents({
      pageNumber,
      pageSize,
    });
    res.status(200).json(events);
  }),
);

export default router;
