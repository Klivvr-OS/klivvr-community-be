import express from 'express';
import helloRouter from './routeHello';
import postRouter from './routePost';

const router = express.Router();

router.use('/hello', helloRouter);
router.use('/post', postRouter);

export default router;
