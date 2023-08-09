import express from 'express';
import postRouter from './postRouter';
import userRouter from './userRouter';
import profileRouter from './profileRouter';
import eventRouter from './eventRouter';

const router = express.Router();

router.use('/posts', postRouter);
router.use('/auth', userRouter);
router.use('/profile', profileRouter);
router.use('/events', eventRouter);

export default router;
