import express from 'express';
import {
  CustomError,
  handleMulterError,
  isAuth,
  multerUpload,
  isNominated,
} from '../middlewares';
import { endpoint } from '../core/endpoint';
import { requestQueryPaginationSchema } from '../helpers';
import { klivvrPickService } from '../modules/KilvvrPick';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';

const router = express.Router();

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
    const userId = req.user?.id;
    const validatedKlivvrPick = klivvrPickService.createKlivvrPickSchema.parse({
      ...req.body,
      photoURL,
    });
    const klivvrPickObject = await klivvrPickService.createOne({
      ...validatedKlivvrPick,
      userId: userId as number,
    });
    res.status(200).json(klivvrPickObject);
  }),
);

router.put(
  '/:id',
  multerUpload.single('image'),
  handleMulterError,
  isAuth,
  isNominated,
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const klivvrPick = await klivvrPickService.findOne({ id });
    if (!klivvrPick) {
      throw new CustomError('Klivvr Pick not found', 404);
    }
    const user = req.user;
    if (klivvrPick.userId !== user?.id) {
      throw new CustomError('Forbidden', 403);
    }
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
  isNominated,
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const klivvrPick = await klivvrPickService.findOne({ id });
    if (!klivvrPick) {
      throw new CustomError('Klivvr Pick not found', 404);
    }
    const user = req.user;
    if (klivvrPick.userId !== user?.id) {
      throw new CustomError('Forbidden', 403);
    }
    const deletedKlivvrPickObject = await klivvrPickService.deleteOne({ id });
    res.status(200).json(deletedKlivvrPickObject);
  }),
);

export default router;
