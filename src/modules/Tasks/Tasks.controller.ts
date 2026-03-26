import { Request, Response, NextFunction } from "express";
import { createTaskValidator } from "../../validators/task.validator";
import { HTTP_STATUS_CODES, STATUS_MESSAGES } from "../../Utils/Constants/statusCodes";
import { TasksService } from "./Tasks.service";
import { messageLogger } from "../../util";
import { getNextSundayRange } from "../../Utils/Helpers";
import { json } from "node:stream/consumers";
import { Notification } from "../NOtifications/Notification.controller";
const tasksService = new TasksService()
export class TasksController {
    static async createTask(req: Request, res: Response) {
        messageLogger('TASK controller', 'Create task ')
        const { error } = createTaskValidator.validate(req.body)
        if (error) {
            return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
                message: STATUS_MESSAGES.BAD_REQUEST,
                error
            })
        }

        const task = await tasksService.createTask(req.body)
        return res.status(HTTP_STATUS_CODES.SUCCESS).json({
            message: "Task created Successfully!!!",
            data: task
        })
    }
    static async getAllTasks(req: Request, res: Response) {

        try {
            messageLogger('MembersController', 'welcome to controller memebers')
            const tasks = await tasksService.fetchTasks()
            const formatData = {
                tasks: tasks,
            }
            res.status(200).json({
                data: tasks

            })
        } catch (error) {
            res.status(500).json({ error: error });

        }


    }
    static async getNextSundayTasks(req: Request, res: Response) {
        try {
            const tasks = await tasksService.fetchNextTasks()
            if (!tasks.task || tasks.task.length === 0) {
                return res.status(404).json({ success: false, message: "No tasks found" });
            }
            Notification.processTask(tasks.task)

            res.status(HTTP_STATUS_CODES.SUCCESS).json({
                success: true,
                data: tasks
            })

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch next Sunday tasks",
                error: error
            });
        }

    }



}