import { helloRepo,HelloRepo } from "../repos/helloRepo";

export class HelloService {
    constructor(private helloRepo: HelloRepo){}

    async createOne(message: string){
        try{
            return await this.helloRepo.create(message);
        } catch (error) {
            throw new Error('Error creating hello object in service layer');
        }
    }

    async findMany(){
        try{
            return await this.helloRepo.findAll();
        } catch (error) {
            throw new Error('Error getting all hello objects in service layer');
        }
    }
}

export const helloService = new HelloService(helloRepo);