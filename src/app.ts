import express from 'express';
import routes from './routes';
import { errorHandlerMiddleware } from './middlewares/';
import { eventsNotificationsEveryDay } from './helpers';

const app = express();

app.use(express.json());
app.use(routes);
app.use(errorHandlerMiddleware);
eventsNotificationsEveryDay();

export default app;
