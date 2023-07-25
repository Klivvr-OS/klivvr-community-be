import express from 'express';
import postRouter from './postRouter';
import userRouter from './userRouter';

const router = express.Router();

router.use('/posts', postRouter);
router.use('/auth', userRouter);

export default router;
