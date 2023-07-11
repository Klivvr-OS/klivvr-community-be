import express from 'express';
import helloRouter from './routeHello';

const router = express.Router();

router.use('/hello', helloRouter);

export default router;
