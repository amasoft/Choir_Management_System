import Router from "express";
import { MembersController } from "./Members.controller";
import { upload } from "../../middlewares/upload";
const membersRouter = Router();

membersRouter.get("/",MembersController.listMembers)
membersRouter.post("/upload_members_data", upload.single("file"), MembersController.createMembers)
export default membersRouter