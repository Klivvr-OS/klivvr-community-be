import express from 'express';
import routes from './routes';
import { errorHandlerMiddleware } from './middlewares/';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(routes);
app.use(errorHandlerMiddleware);

export default app;
