import { Request, Response, NextFunction } from 'express';

export function endpoint(
  handler: (req: Request, res: Response) => Promise<void> | void,
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      return await handler(req, res);
    } catch (err: unknown) {
      next(err);
    }
  };
}
