import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS_CODES, STATUS_MESSAGES } from "../../Utils/Constants/statusCodes";
import { TasksService } from "./Tasks.service";
import { messageLogger } from "../../util";
import { getNextSundayRange } from "../../Utils/Helpers";
import { json } from "node:stream/consumers";
const tasksService = new TasksService()
export class TasksController {
    static async createTask(req: Request, res: Response) {
        messageLogger('TASK controller', 'Create task ')
        // Body is already validated by validateTaskBody, earlier in the route
        // chain (see Tasks.route.ts) — no need to re-validate here.
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

        messageLogger(`getNextSundayTasks`,`Time::  ${new Date()}`)
        try {
            const tasks = await tasksService.fetchNextTasks()
            if (!tasks.task || tasks.task.length === 0) {
                return res.status(404).json({ success: false, message: "No Pending Tasks!!!" });
            }
            // This endpoint only reads data now — it used to also trigger real
            // WhatsApp/SMS sends as a side effect of a GET request, which meant
            // anyone hitting it (a refresh, a health check, a monitoring bot)
            // could re-send reminders. Sending is now handled exclusively by
            // the scheduled worker (see schedular.ts / notification.worker.ts).

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

// /bin/sh -c "rm -rf $RAILWAY_VOLUME_MOUNT_PATH/lost+found/ && exec docker-entrypoint.sh redis-server --requirepass $REDIS_PASSWORD --save 60 1 --dir $RAILWAY_VOLUME_MOUNT_PATH"