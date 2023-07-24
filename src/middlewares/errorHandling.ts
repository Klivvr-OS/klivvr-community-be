import { NextFunction, Request, Response } from 'express';

export class CustomError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const errorHandlerMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof CustomError) {
    const statusCode = err.status;
    const message = err.message;

    return res.status(statusCode).json({
      message: message,
    });
  }
  return res.status(500).json({
    message: 'Internal Server Error',
  });
};
