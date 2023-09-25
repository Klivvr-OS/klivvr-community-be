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
      WITH UserLikes AS (
        SELECT "postId"
        FROM "Like"
        WHERE "userId" = ${userId}
      )
      SELECT
        p.*,
        u."firstName",
        u."lastName",
        u.image AS "userImage",
        COUNT(l.*)::int AS likes,
        COUNT(c.*)::int AS comments,
        CASE
          WHEN ul."postId" IS NOT NULL THEN true
          ELSE false
        END AS "isLiked"
      FROM "Post" p
      JOIN "User" u ON p."userId" = u.id
      LEFT JOIN "Like" l ON p.id = l."postId"
      LEFT JOIN "Comment" c ON p.id = c."postId"
      LEFT JOIN UserLikes ul ON p.id = ul."postId"
      WHERE TRUE ${postIdQuery}
      GROUP BY p.id, u.id, ul."postId"
      ORDER BY p."createdAt" DESC
      LIMIT ${take}
      OFFSET ${skip};
    `,
      this.client.post.count({ where: { ...(postId ? { id: postId } : {}) } }),
    ]);
    return { posts: query[0], total: query[1] };
  }
}

export const postRepo = new PostRepo(prisma);
