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
    const totalLikesComments = await postService.countLikesAndComments({
      pageNumber,
      pageSize,
    });
    if (!totalLikesComments) {
      throw new CustomError('Posts not found', 404);
    }
    res.status(200).json({ posts: totalLikesComments });
  }),
);

router.get(
  '/:id',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const post = await postService.countLikesAndComments(
      {
        pageNumber,
        pageSize,
      },
      id,
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
  '/:id/like',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const post = await postService.findOne({ id });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    const like = await likeService.findLike({
      userId: req.user?.id as number,
      postId: id,
    });
    if (like) {
      throw new CustomError('Forbidden', 403);
    }
    const userId = req.user?.id;
    await likeService.addLike({
      userId: userId as number,
      postId: id,
    });
    const user = await userService.findOne({ id: post.userId });
    const userWhoLiked = await userService.findOne({ id: userId as number });
    if (user && userWhoLiked) {
      const title = 'New like',
        description = `${userWhoLiked.firstName} ${userWhoLiked.lastName} liked your post`;
      await Promise.all([
        novuService.notificationsTrigger(
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
  '/:id/unlike',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const post = await postService.findOne({ id });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    const userId = req.user?.id;
    const like = await likeService.findLike({
      userId: userId as number,
      postId: id,
    });
    if (like) {
      await likeService.unlike({ id: like.id });
    }
    res.status(200).json({ message: 'Unliked' });
  }),
);

router.post(
  '/:id/comments',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const post = await postService.findOne({ id });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    const user = await userService.findOne({ id: post.userId });
    const userWhoCommented = await userService.findOne({
      id: req.user?.id as number,
    });
    const userId = req.user?.id;
    const { content } = postService.createCommentSchema.parse(req.body);
    const postComments = await commentService.createComment({
      content,
      userId: userId as number,
      postId: id,
    });
    if (user && userWhoCommented) {
      const title = 'New comment',
        description = `${userWhoCommented.firstName} ${userWhoCommented.lastName} commented on your post`;
      await Promise.all([
        novuService.notificationsTrigger(
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
    res.status(201).json(postComments);
  }),
);

router.get(
  '/:id/comments',
  endpoint(async (req, res) => {
    const { pageNumber, pageSize } = requestQueryPaginationSchema.parse(
      req.query,
    );
    const id = Number(req.params.id);
    const post = await postService.findOne({ id });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }
    const postComments = await commentService.findPostComments(
      { postId: id },
      { pageNumber, pageSize },
    );
    res.status(200).json({ post: post, comments: postComments });
  }),
);

router.put(
  '/:id/comments/:commentId',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const commentId = Number(req.params.commentId);

    const post = await postService.findOne({ id });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }

    const comment = await commentService.findComment({ id: commentId });
    if (!comment) {
      throw new CustomError('Comment not found', 404);
    }

    const userId = req.user?.id;
    if (comment.userId !== userId) {
      throw new CustomError('Forbidden', 403);
    }

    const { content } = postService.updateCommentSchema.parse(req.body);
    const updatedCommentObject = await commentService.updateComment(
      { id: commentId },
      { content },
    );

    res.status(200).json({
      message: 'Comment updated successfully',
      updatedCommentObject,
    });
  }),
);

router.get(
  '/:id/comments/:commentId',
  endpoint(async (req, res) => {
    const id = Number(req.params.id);
    const commentId = Number(req.params.commentId);

    const post = await postService.findOne({ id });
    if (!post) {
      throw new CustomError('Post not found', 404);
    }

    const comment = await commentService.findComment({ id: commentId });
    if (!comment) {
      throw new CustomError('Comment not found', 404);
    }

    res.status(200).json(comment);
  }),
);

export default router;
