import { Prisma, PrismaClient } from "@prisma/client";

export class PontoRepository {

    constructor(
        private prisma: PrismaClient
    ) {
        this.prisma = prisma;
    }

    async store(data: Prisma.RegisterCreateInput) {
        return this.prisma.register.create({
            data
        })
    }
}