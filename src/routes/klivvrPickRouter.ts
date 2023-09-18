import express from 'express';
import {
  CustomError,
  handleMulterError,
  multerUpload,
  isNominated,
  verifyModerator,
} from '../middlewares';
import { endpoint } from '../core/endpoint';
import { requestQueryPaginationSchema } from '../helpers';
import { klivvrPickService } from '../modules/KilvvrPick';
import { klivvrPickNomineeService } from '../modules/KlivvrPickNominee';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import {
  deviceTokenService,
  notificationService,
  novuService,
} from '../modules';
import {
  getKlivvrPickNominationPayload,
  getPicksNotificationPayload,
} from '../modules/Notification/services/config';

const router = express.Router();

router.post(
  '/nominate',
  verifyModerator,
  endpoint(async (req, res) => {
    const nominatorUserId = Number(req.user?.id);
    const { nomineeId } = req.body as { nomineeId: number };
    const klivvrPickNomineeObject = await klivvrPickNomineeService.nominate(
      nomineeId,
      nominatorUserId,
    );
    const { title, description } = getKlivvrPickNominationPayload();
    await Promise.all([
      novuService.triggerNotification(
        { title, description },
        nomineeId.toString(),
      ),
      notificationService.createOne({ title, description, userId: nomineeId }),
    ]);
    res.status(201).json(klivvrPickNomineeObject);
  }),
);

router.get(
  '/',
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const klivvrPickObjects = await klivvrPickService.findManyWithPagination(
      {},
      { pageNumber, pageSize },
    );
    res.status(200).json(klivvrPickObjects);
  }),
);

router.get(
  '/this-week-picks',
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const klivvrPickObjects = await klivvrPickService.findThisWeeksPicks({
      pageNumber,
      pageSize,
    });
    res.status(200).json(klivvrPickObjects);
  }),
);

router.get(
  '/:id',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const klivvrPick = await klivvrPickService.findOne(
      { id },
      {
        select: {
          name: true,
          description: true,
          link: true,
          category: true,
          image: true,
          nominee: {
            select: {
              nominee: {
                select: {
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    );
    if (!klivvrPick) {
      throw new CustomError('Klivvr Pick not found', 404);
    }
    res.status(200).json(klivvrPick);
  }),
);

router.post(
  '/',
  multerUpload.single('image'),
  handleMulterError,
  isNominated,
  endpoint(async (req, res) => {
    const userId = req.user?.id;
    let image;
    if (req.file) {
      const localFilePath = req.file.path;
      const { isSuccess, imageURL } = await cloudinaryInstance.uploadImage(
        localFilePath,
      );
      if (!isSuccess) {
        throw new Error();
      }
      image = imageURL;
    }
    const validatedKlivvrPick = klivvrPickService.createKlivvrPickSchema.parse({
      ...req.body,
      image,
    });
    const klivvrPickObject = await klivvrPickService.createOne({
      ...validatedKlivvrPick,
      nomineeId: userId as number,
    });
    const { title, description } = getPicksNotificationPayload();
    const usersWithDeviceTokens = await deviceTokenService.findMany();
    for (const user of usersWithDeviceTokens) {
      if (user.userId !== userId) {
        await Promise.all([
          novuService.triggerNotification(
            { title, description },
            user.userId.toString(),
          ),
          notificationService.createOne({
            title,
            description,
            userId: user.userId,
          }),
        ]);
      }
    }
    res.status(200).json(klivvrPickObject);
  }),
);

router.put(
  '/:id',
  multerUpload.single('image'),
  handleMulterError,
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    await klivvrPickService.findOneWithError({ id, nomineeId: req.user?.id });
    let image;
    if (req.file) {
      const localFilePath = req.file.path;
      const { isSuccess, imageURL } = await cloudinaryInstance.uploadImage(
        localFilePath,
      );
      if (!isSuccess) {
        throw new Error();
      }
      image = imageURL;
    }
    const validatedKlivvrPick = klivvrPickService.updateKlivvrPickSchema.parse({
      ...req.body,
      image,
    });
    const updatedKlivvrPickObject = await klivvrPickService.updateOne(
      { id },
      validatedKlivvrPick,
    );
    res.status(200).json(updatedKlivvrPickObject);
  }),
);

router.delete(
  '/:id',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    await klivvrPickService.findOneWithError({ id, nomineeId: req.user?.id });
    const deletedKlivvrPickObject = await klivvrPickService.deleteOne({ id });
    res.status(200).json(deletedKlivvrPickObject);
  }),
);

export default router;
