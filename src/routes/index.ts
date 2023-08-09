import express from 'express';
import postRouter from './postRouter';
import authRouter from './authRouter';
import profileRouter from './profileRouter';
import eventRouter from './eventRouter';
import userRouter from './userRouter';

const router = express.Router();

router.use('/posts', postRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/events', eventRouter);
router.use('/users', userRouter);

export default router;
