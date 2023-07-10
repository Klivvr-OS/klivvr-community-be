import { helloRepo, HelloRepo } from "../repos/helloRepo";

export class HelloService {
  constructor(private helloRepo: HelloRepo) {}

  async createOne(message: string) {
    return await this.helloRepo.create(message);
  }

  async findMany() {
    return await this.helloRepo.findAll();
  }
}

export const helloService = new HelloService(helloRepo);
