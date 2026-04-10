import importExcelData from "../../Utils/fileutils"
import { MemberRepository } from "./Member.repository"
const membersRepo = new MemberRepository()
export class MembersService {
    async uploadMembers(file:Express.Multer.File) {

        const users = await importExcelData(file)
        return {
            users: users
        }
    }
    async fetchMembers() {
        const users = await membersRepo.fetchAllMembers()

        return {
            count: users.length,
            users,

        }
    }
}