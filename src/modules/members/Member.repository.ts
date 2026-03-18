import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
export class MemberRepository {
    async fetchAllMembers() {
        const users = await prisma.member.findMany({

        })
        return users
    }
}