import { Prisma } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Prisma.UserGetPayload<{ select: { id: true } }>;
    }
  }
}
