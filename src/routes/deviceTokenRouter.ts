import express from 'express';
import { endpoint } from '../core/endpoint';
import { deviceTokenService } from '../modules';

const router = express.Router();

router.post(
  '/',
  endpoint(async (req, res) => {
    const deviceToken = deviceTokenService.createDeviceTokenSchema.parse(
      req.body,
    );
    const userId = req.user?.id;
    const existingUserDeviceToken = await deviceTokenService.findOne({
      userId: userId as number,
    });
    if (existingUserDeviceToken) {
      await deviceTokenService.updateOne(
        {
          userId: userId as number,
        },
        {
          token: deviceToken.token,
          deviceType: deviceToken.deviceType,
        },
      );
    }
    const existingDeviceToken = await deviceTokenService.findOne({
      token: deviceToken.token,
    });
    if (existingDeviceToken) {
      await deviceTokenService.updateOne(
        { id: existingDeviceToken.id },
        { userId: userId as number },
      );
      res.status(200).json({ message: 'Device token updated successfully' });
    }
    await deviceTokenService.createOne({
      ...deviceToken,
      userId: userId as number,
    });
    res.status(201).json({ message: 'Device token created successfully' });
  }),
);

export default router;
