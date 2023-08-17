import express from 'express';
import postRouter from './postRouter';
import authRouter from './authRouter';
import profileRouter from './profileRouter';
import eventRouter from './eventRouter';
import userRouter from './userRouter';
import klivvrPickRouter from './klivvrPickRouter';
import { isAuth } from '../middlewares';

const router = express.Router();

router.use('/auth', authRouter);
router.use(isAuth);
router.use('/posts', postRouter);
router.use('/profile', profileRouter);
router.use('/events', eventRouter);
router.use('/klivvr-picks', klivvrPickRouter);
router.use('/users', userRouter);

export default router;
