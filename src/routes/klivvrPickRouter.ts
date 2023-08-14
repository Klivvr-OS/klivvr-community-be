import express from 'express';
import {
  CustomError,
  handleMulterError,
  isAuth,
  multerUpload,
  isNominated,
  verifyModerator,
} from '../middlewares';
import { endpoint } from '../core/endpoint';
import { requestQueryPaginationSchema } from '../helpers';
import { klivvrPickService } from '../modules/KilvvrPick';
import { klivvrPickNomineeService } from '../modules/KlivvrPickNominee';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';

const router = express.Router();

router.post(
  '/nominate',
  isAuth,
  verifyModerator,
  endpoint(async (req, res) => {
    const nominatorUserId = Number(req.user?.id);
    const { nomineeId } = req.body as { nomineeId: number };
    const klivvrPickNomineeObject = await klivvrPickNomineeService.nominate(
      nomineeId,
      nominatorUserId,
    );
    res.status(201).json(klivvrPickNomineeObject);
  }),
);

router.get(
  '/',
  isAuth,
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
  isAuth,
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
  isAuth,
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
          photoURL: true,
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
  isAuth,
  isNominated,
  endpoint(async (req, res) => {
    const userId = req.user?.id;
    let photoURL;
    if (req.file) {
      const localFilePath = req.file.path;
      const { isSuccess, imageURL } = await cloudinaryInstance.uploadImage(
        localFilePath,
      );
      if (!isSuccess) {
        throw new Error();
      }
      photoURL = imageURL;
    }
    const validatedKlivvrPick = klivvrPickService.createKlivvrPickSchema.parse({
      ...req.body,
      photoURL,
    });
    const klivvrPickObject = await klivvrPickService.createOne({
      ...validatedKlivvrPick,
      nomineeId: userId as number,
    });
    res.status(200).json(klivvrPickObject);
  }),
);

router.put(
  '/:id',
  multerUpload.single('image'),
  handleMulterError,
  isAuth,
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    await klivvrPickService.findOneWithError({ id, nomineeId: req.user?.id });
    let photoURL;
    if (req.file) {
      const localFilePath = req.file.path;
      const { isSuccess, imageURL } = await cloudinaryInstance.uploadImage(
        localFilePath,
      );
      if (!isSuccess) {
        throw new Error();
      }
      photoURL = imageURL;
    }
    const validatedKlivvrPick = klivvrPickService.updateKlivvrPickSchema.parse({
      ...req.body,
      photoURL,
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
  isAuth,
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    await klivvrPickService.findOneWithError({ id, nomineeId: req.user?.id });
    const deletedKlivvrPickObject = await klivvrPickService.deleteOne({ id });
    res.status(200).json(deletedKlivvrPickObject);
  }),
);

export default router;
