import Router from "express";
import { MembersController } from "./Members.controller";
const membersRouter = Router();

membersRouter.get("/",MembersController.listMembers)
membersRouter.post("/upload_members_data",MembersController.createMembers)
export default membersRouter