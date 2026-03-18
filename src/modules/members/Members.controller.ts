import { Request, Response, NextFunction } from "express";
import { messageLogger } from "../../util";
import importExcelData from "../../Utils/fileutils";
import { MembersService } from "./Members.service";
const membersService = new MembersService()
export class MembersController {
    static async createMembers(req: Request, res: Response) {
        messageLogger('MembersController', 'welcome to controller memebers')
        const result = await membersService.uploadMembers()
        res.status(200).json(result)
    }

    static async listMembers(req: Request, res: Response) {

        try {
            messageLogger('MembersController', 'welcome to controller memebers')
            const users = await membersService.fetchMembers()
            const formatData={
                users:users,
            }
            res.status(200).json({
                data:users
            
            })
        } catch (error) {
            res.status(500).json({ error: error});

        }


    }

    async fetchAllMembers() {

    }
}