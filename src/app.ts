import express from 'express';
import routes from './routes';
import { errorHandlerMiddleware } from './middlewares/';
import { scheduleDailyNotification } from './helpers';

const app = express();

app.use(express.json());
app.use(routes);
app.use(errorHandlerMiddleware);
scheduleDailyNotification();

export default app;
