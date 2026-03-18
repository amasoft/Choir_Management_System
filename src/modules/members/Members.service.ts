import importExcelData from "../../Utils/fileutils"
import { MemberRepository } from "./Member.repository"
const membersRepo = new MemberRepository()
export class MembersService {
    async uploadMembers() {

        const users = await importExcelData()
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