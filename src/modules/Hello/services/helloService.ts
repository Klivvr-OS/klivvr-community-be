import { helloRepo, HelloRepo } from "../repos/helloRepo";

export class HelloService {
  constructor(private helloRepo: HelloRepo) {}

  async createOne(message: string) {
    return await this.helloRepo.createOne(message);
  }

  async findMany() {
    return await this.helloRepo.findMany();
  }
}

export const helloService = new HelloService(helloRepo);
