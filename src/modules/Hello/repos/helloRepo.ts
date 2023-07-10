import { PrismaClient } from "@prisma/client";
import prisma from "../../../database/prisma/client";


export class HelloRepo {

    constructor(private prisma: PrismaClient){}

    async create(message: string){
        try{
            return await prisma.hello.create({
                data: {
                    message
                }
            });
        } catch (error) {
            throw new Error('Error creating hello object in repo layer')
        }
    }

    async findAll(){
        try{
            return await prisma.hello.findMany();
        } catch (error) {
            throw new Error('Error getting all hello objects in repo layer')
        }
    }
}

export const helloRepo = new HelloRepo(prisma);