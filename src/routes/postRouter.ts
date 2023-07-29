import { postService, userService } from '../modules';
import express from 'express';
import { multerUpload } from '../middlewares/Multer';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import { handleMulterError } from '../middlewares/Multer';
import { Request, Response } from 'express';
import { endpoint } from '../core/endpoint';
import { CustomError } from '../middlewares';
import { secretAccessKey } from '../config';

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
    const token = req.cookies.accessToken;
    if (!token) {
      throw new CustomError('Unauthorized', 401);
    }
    const user = await userService.authenticateUser(token, secretAccessKey);
    if (!user) {
      throw new CustomError('Unauthorized', 401);
    }
    const userId = user.id;
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
  endpoint(async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new CustomError('Unauthorized', 401);
    }
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
    const token = req.cookies.accessToken;
    if (!token) {
      throw new CustomError('Unauthorized', 401);
    }
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
  handleMulterError,
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const posts = await postService.findOne({ id });
    if (!posts) {
      throw new CustomError('Post not found', 404);
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
    const token = req.cookies.accessToken;
    if (!token) {
      throw new CustomError('Invalid Credentials', 401);
    }
    const user = await userService.authenticateUser(token, secretAccessKey);
    if (!user) {
      throw new CustomError('Invalid Credentials', 401);
    }
    const userId = user.id;
    if (posts.userId !== userId) {
      throw new CustomError('Unauthorized', 401);
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
  endpoint(async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new CustomError('Unauthorized', 401);
    }
    const user = await userService.authenticateUser(token, secretAccessKey);
    if (!user) {
      throw new CustomError('Unauthorized', 401);
    }
    const id = Number(req.params.id);
    const deletedpostObject = await postService.deleteOne({ id });
    if (!deletedpostObject) {
      throw new CustomError('Post not found', 404);
    }
    const userId = user.id;
    if (deletedpostObject.userId !== userId) {
      throw new CustomError('Unauthorized', 401);
    }
    res.status(200).json(deletedpostObject);
  }),
);

export default router;
