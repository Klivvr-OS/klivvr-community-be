import express from 'express';
import { endpoint } from '../core/endpoint';
import { deviceTokenService } from '../modules';

const router = express.Router();

router.put(
  '/',
  endpoint(async (req, res) => {
    const deviceToken = deviceTokenService.updateDeviceTokenSchema.parse(
      req.body,
    );
    const userId = req.user?.id;
    await deviceTokenService.upsertOne(
      { userId: userId as number },
      { ...deviceToken, userId: userId as number },
    );
    res.status(200).json({ message: 'Device token updated successfully' });
  }),
);

export default router;
