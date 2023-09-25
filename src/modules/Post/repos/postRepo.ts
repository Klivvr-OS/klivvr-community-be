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
      SELECT 
        p.*,
        u."firstName", u."lastName", u.image AS "userImage",
      (SELECT COUNT(*)::INT FROM "Like" l  WHERE l."postId" = p.id) AS likes,
      (SELECT COUNT(*)::INT FROM "Comment" c WHERE c."postId" = p.id ) AS comments,
      (SELECT EXISTS(SELECT * FROM "Like" l WHERE l."userId" = ${userId} AND l."postId" = p.id))
        AS "isLiked"
      FROM "Post" p 
      JOIN "User" u ON p."userId" = u.id
      WHERE true ${postIdQuery}
      GROUP BY p.id, u.id
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
