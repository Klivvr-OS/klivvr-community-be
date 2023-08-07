import { z } from 'zod';

export const requestQuerySchema = z.object({
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export interface Pagination {
  skip: number;
  take: number;
}

export interface PaginationQuery {
  pageNumber: number;
  pageSize: number;
}

export const paginate = ({
  pageNumber,
  pageSize,
}: PaginationQuery): Pagination => {
  const skip = (pageNumber - 1) * pageSize;
  return { skip, take: pageSize };
};
