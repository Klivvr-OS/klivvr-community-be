import express from 'express';
import { endpoint } from '../core/endpoint';
import { handleMulterError, multerUpload } from '../middlewares';
import { requestQueryPaginationSchema } from '../helpers';
import { eventService } from '../modules/Event';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';

const router = express.Router();

router.post(
  '/',
  multerUpload.single('image'),
  handleMulterError,
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
    const validatedevent = eventService.createEventSchema.parse({
      ...req.body,
      image,
    });

    const eventObject = await eventService.createOne({
      ...validatedevent,
      userId: userId as number,
    });
    res.status(200).json(eventObject);
  }),
);

router.get(
  '/',
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const events = await eventService.findEvents({ pageNumber, pageSize });
    res.status(200).json(events);
  }),
);

router.put(
  '/:id',
  multerUpload.single('image'),
  handleMulterError,
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    await eventService.findOneWithError({ id, userId: req.user?.id });
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
    const validatedevent = eventService.updateEventSchema.parse({
      ...req.body,
      image,
    });
    const updatedeventObject = await eventService.updateOne(
      { id },
      validatedevent,
    );
    res.status(200).json(updatedeventObject);
  }),
);

router.delete(
  '/:id',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    await eventService.findOneWithError({ id, userId: req.user?.id });
    const deletedEvent = await eventService.deleteOne({ id });
    res.status(200).json(deletedEvent);
  }),
);

export default router;
