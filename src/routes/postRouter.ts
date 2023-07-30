import { postService } from '../modules';
import express from 'express';
import { multerUpload } from '../middlewares/Multer';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import { handleMulterError } from '../middlewares/Multer';
import { Request, Response } from 'express';
import { endpoint } from '../core/endpoint';
import { CustomError } from '../middlewares';
import { isAuth } from '../middlewares/';

const router = express.Router();

router.post(
  '/',
  isAuth,
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
    const userId = res.locals.user.id;
    const description = postService.createPostSchema.parse({
      description: req.body.description,
    }).description;
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
  isAuth,
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
  isAuth,
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
  isAuth,
  multerUpload.single('image'),
  handleMulterError,
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const post = await postService.findOne({ id });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    const userId = res.locals.user.id;
    if (post.userId !== userId) {
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
    const updatePostSchema = postService.updatePostSchema.parse({
      description: req.body.description,
    }).description;
    const updatedpostObject = await postService.updateOne(
      { id },
      {
        description: updatePostSchema,
        photoURL,
      },
    );
    res.status(200).json(updatedpostObject);
  }),
);

router.delete(
  '/:id',
  isAuth,
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const post = await postService.findOne({ id });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    const userId = res.locals.user.id;
    if (post.userId !== userId) {
      throw new CustomError('Forbidden', 403);
    }
    const deletedpostObject = await postService.deleteOne({ id });
    res.status(200).json(deletedpostObject);
  }),
);

export default router;
