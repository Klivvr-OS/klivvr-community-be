import { Prisma, type PrismaClient } from '@prisma/client';
import prisma from '../../../database/client';
import { paginate } from '../../../helpers';

export class PostRepo {
  constructor(private readonly client: PrismaClient) {}

  async createOne(args: Prisma.PostUncheckedCreateInput) {
    return await this.client.post.create({ data: args });
  }

  async findManyWithPagination(
    query: Prisma.PostWhereInput,
    options: { pageNumber: number; pageSize: number },
  ) {
    return await this.client.post.findMany({
      where: query,
      ...paginate(options),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(query: Prisma.PostWhereUniqueInput) {
    return await this.client.post.findFirst({ where: query });
  }

  async updateOne(
    query: Prisma.PostWhereUniqueInput,
    args: Prisma.PostUpdateInput,
  ) {
    return await this.client.post.update({ where: query, data: args });
  }

  async deleteOne(query: Prisma.PostWhereUniqueInput) {
    return await this.client.post.delete({ where: query });
  }

  async postsWithLikesAndComments(
    options: { pageNumber: number; pageSize: number },
    postId?: number,
    userId?: number,
  ) {
    const { skip, take } = paginate(options);
    const postIdQuery = postId
      ? Prisma.sql`and p.id = ${postId}`
      : Prisma.sql``;
    const query = await Promise.all([
      this.client.$queryRaw`
        SELECT p.*, u."firstName", u."lastName", u.image AS "userImage", 
        COUNT(DISTINCT l."id")::int AS likes, COUNT(DISTINCT c."id")::int AS comments,
        CASE WHEN l."userId" = ${userId} THEN true ELSE false END AS "isLiked"
        FROM "Post" p 
        LEFT JOIN "Like" l ON p.id = l."postId" 
        LEFT JOIN "Comment" c ON p.id = c."postId" 
        LEFT JOIN "User" u ON p."userId" = u.id
        WHERE true ${postIdQuery}
        GROUP BY p.id, u.id, l."userId"
        ORDER BY p."createdAt" DESC
        LIMIT ${take}
        OFFSET ${skip}
    `,
      this.client.post.count({ where: { ...(postId ? { id: postId } : {}) } }),
    ]);
    return { posts: query[0], total: query[1] };
  }
}

export const postRepo = new PostRepo(prisma);
