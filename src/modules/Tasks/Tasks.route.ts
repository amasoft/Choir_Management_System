import Router from "express";
import { TasksController } from "./Tasks.controller";
import { checkMemberExist, checkTasksExist } from "../../middlewares/tasks.middleware";
const tasksRouter = Router();

tasksRouter.post("/", 
    checkMemberExist,
     checkTasksExist,
     TasksController.createTask
)
tasksRouter.get('/listtasks',TasksController.getAllTasks)
tasksRouter.get('/nexttasks',TasksController.getNextSundayTasks)
// membersRouter.post("/upload_members_data",MembersController.createMembers)
export default tasksRouter