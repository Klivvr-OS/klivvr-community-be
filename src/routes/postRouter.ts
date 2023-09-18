import {
  notificationService,
  postService,
  novuService,
  likeService,
  commentService,
  userService,
} from '../modules';
import express from 'express';
import { multerUpload } from '../middlewares/Multer';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import { handleMulterError } from '../middlewares/Multer';
import { Request, Response } from 'express';
import { endpoint } from '../core/endpoint';
import { CustomError } from '../middlewares';
import { requestQueryPaginationSchema } from '../helpers';
import {
  getCommentNotificationPayload,
  getLikeNotificationPayload,
} from '../modules/Notification/services/config';

const router = express.Router();

router.post(
  '/',
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
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const userId = req.user?.id;
    const postsAndItsTotal = await postService.postsWithLikesAndComments(
      {
        pageNumber,
        pageSize,
      },
      undefined,
      userId,
    );
    res.status(200).json(postsAndItsTotal);
  }),
);

router.get(
  '/:id',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const userId = req.user?.id;
    const post = await postService.postsWithLikesAndComments(
      { pageNumber, pageSize },
      id,
      userId,
    );
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    res.status(200).json(post);
  }),
);

router.put(
  '/:id',
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

router.post(
  '/:postId/like',
  endpoint(async (req, res) => {
    const postId = Number(req.params.postId);
    const post = await postService.findOne({ id: postId });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    const like = await likeService.findOne({
      userId: req.user?.id as number,
      postId,
    });
    if (like) {
      throw new CustomError('Forbidden', 403);
    }
    const userId = req.user?.id;
    await likeService.createOne({
      userId: userId as number,
      postId,
    });
    const user = await userService.findOne({ id: post.userId });
    const userWhoLiked = await userService.findOne({ id: userId as number });
    if (user && userWhoLiked) {
      const { title, description } = getLikeNotificationPayload({
        name: `${userWhoLiked.firstName} ${userWhoLiked.lastName}`,
      });
      await Promise.all([
        novuService.triggerNotification(
          {
            title,
            description,
          },
          user.id.toString(),
        ),
        notificationService.createOne({
          title,
          description,
          userId: user.id,
        }),
      ]);
    }
    res.status(200).json({ message: 'Liked' });
  }),
);

router.delete(
  '/:postId/unlike',
  endpoint(async (req, res) => {
    const postId = Number(req.params.postId);
    const post = await postService.findOne({ id: postId });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    const userId = req.user?.id;
    const like = await likeService.findOne({
      userId: userId as number,
      postId,
    });
    if (like) {
      await likeService.deleteOne({ id: like.id });
    }
    res.status(200).json({ message: 'Unliked' });
  }),
);

router.post(
  '/:postId/comments',
  endpoint(async (req, res) => {
    const postId = Number(req.params.postId);
    const post = await postService.findOne({ id: postId });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    const userWhoCommented = await userService.findOne({
      id: req.user?.id as number,
    });
    const userId = req.user?.id;
    const { content } = postService.createCommentSchema.parse(req.body);
    const postComments = await commentService.createOne({
      content,
      userId: userId as number,
      postId,
    });
    if (userWhoCommented) {
      const { title, description } = getCommentNotificationPayload({
        name: `${userWhoCommented.firstName} ${userWhoCommented.lastName}`,
      });
      await Promise.all([
        novuService.triggerNotification(
          {
            title,
            description,
          },
          post.userId.toString(),
        ),
        notificationService.createOne({
          title,
          description,
          userId: post.userId,
        }),
      ]);
    }
    res.status(201).json(postComments);
  }),
);

router.get(
  '/:postId/comments',
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const postId = Number(req.params.postId);
    const postComments = await commentService.findManyWithPagination(
      { postId },
      { pageNumber, pageSize },
    );
    res
      .status(200)
      .json({ message: 'Comments fetched successfully', data: postComments });
  }),
);

router.put(
  '/:postId/comments/:commentId',
  endpoint(async (req, res) => {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const userId = req.user?.id;

    const comment = await commentService.findOne({
      id: commentId,
      postId,
      userId,
    });

    if (!comment) {
      throw new CustomError('Comment not found', 404);
    }

    const { content } = postService.updateCommentSchema.parse(req.body);
    const updatedComment = await commentService.updateOne(
      { id: commentId },
      { content },
    );

    res
      .status(200)
      .json({ message: 'Comment updated successfully', updatedComment });
  }),
);

export default router;
