import express from 'express';
import helloRouter from './routeHello';
import postRouter from './routePost';
import userRouter from './userRouter';

const router = express.Router();

router.use('/hello', helloRouter);
router.use('/posts', postRouter);
router.use('/auth', userRouter);

export default router;
