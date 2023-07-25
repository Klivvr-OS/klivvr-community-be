import { postService } from '../modules';
import express from 'express';
import { multerUpload } from '../middlewares/Multer';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import { handleMulterError } from '../middlewares/Multer';
import { Request, Response } from 'express';
import { endpoint } from '../core/endpoint';
import { CustomError } from '../middlewares';

const router = express.Router();

router.post(
  '/',
  multerUpload.single('image'),
  handleMulterError,
  endpoint(async (req: Request, res: Response) => {
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
    const userId = Number(req.body.userId as unknown as string);
    const { description } = req.body;
    const newpostObject = await postService.createOne({
      description,
      photoURL,
      userId,
    });
    res.status(201).json(newpostObject);
  }),
);

router.get(
  '/',
  endpoint(async (req, res) => {
    const postObjects = await postService.findMany();
    if (!postObjects) {
      throw new CustomError('Posts not found', 404);
    }
    res.status(200).json(postObjects);
  }),
);

router.get(
  '/:id',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const postObject = await postService.findOne({ id });
    if (!postObject) {
      throw new CustomError('Post not found', 404);
    }
    res.status(200).json(postObject);
  }),
);

router.put(
  '/:id',
  multerUpload.single('image'),
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const { description, photoURL } = req.body;
    const posts = await postService.findOne({ id });
    if (!posts) {
      throw new CustomError('Post not found', 404);
    }
    const updatedpostObject = await postService.updateOne(
      { id },
      {
        description,
        photoURL,
      },
    );
    res.status(200).json(updatedpostObject);
  }),
);

router.delete(
  '/:id',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const deletedpostObject = await postService.deleteOne({ id });
    if (!deletedpostObject) {
      throw new CustomError('Post not found', 404);
    }
    res.status(200).json(deletedpostObject);
  }),
);

export default router;
