import express from 'express';
import helloRouter from './routeHello';
import userRouter from './userRouter';

const router = express.Router();

router.use('/hello', helloRouter);
router.use('/auth', userRouter);

export default router;
