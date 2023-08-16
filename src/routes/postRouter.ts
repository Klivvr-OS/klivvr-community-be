import { postService } from '../modules';
import express from 'express';
import { multerUpload } from '../middlewares/Multer';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import { handleMulterError } from '../middlewares/Multer';
import { Request, Response } from 'express';
import { endpoint } from '../core/endpoint';
import { CustomError } from '../middlewares';
import { isAuth } from '../middlewares/';
import { requestQueryPaginationSchema } from '../helpers';

const router = express.Router();

router.post(
  '/',
  isAuth,
  multerUpload.single('image'),
  handleMulterError,
  endpoint(async (req: Request, res: Response) => {
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
    const userId = req.user?.id;
    const { description } = postService.createPostSchema.parse(req.body);
    const newpostObject = await postService.createOne({
      description,
      image,
      userId: userId as number,
    });
    res.status(201).json(newpostObject);
  }),
);

router.get(
  '/',
  isAuth,
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const postObjects = await postService.findManyWithPagination(
      {},
      { pageNumber, pageSize },
    );
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
    const userId = req.user?.id;
    if (post.userId !== userId) {
      throw new CustomError('Forbidden', 403);
    }
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
    const { description } = postService.updatePostSchema.parse(req.body);
    const updatedpostObject = await postService.updateOne(
      { id },
      { description, image },
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
    const userId = req.user?.id;
    if (post.userId !== userId) {
      throw new CustomError('Forbidden', 403);
    }
    const deletedpostObject = await postService.deleteOne({ id });
    res.status(200).json(deletedpostObject);
  }),
);

export default router;
