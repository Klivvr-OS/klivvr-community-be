import { postRepo, type PostRepo } from '../repos/postRepo';

export class PostService {
  constructor(private readonly postRepo: PostRepo) {}

  async createOne(description: string, photoURL: string, userId: number) {
    return await this.postRepo.createOne(description, photoURL, userId);
  }

  async findMany() {
    return await this.postRepo.findMany();
  }

  async findOne(id: number) {
    return await this.postRepo.findOne(id);
  }
}

export const postService = new PostService(postRepo);
