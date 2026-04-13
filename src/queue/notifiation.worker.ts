// import { bullMQconnection } from './notification.queue';
// queue/notification.worker.ts
import { Worker } from "bullmq";
// import { connection } from "./connection";
import { connection } from "./notification.queue";
// import { bullMQconnection, connection } from "./notification.queue";
import { messageLogger } from "../util";
import { whatsappClient } from "../whatsapp/whatsapp.client";
import { sendSMS } from "../Utils/autoSMS";
import { TasksController } from "../modules/Tasks/Tasks.controller";
import { TasksService } from "../modules/Tasks/Tasks.service";
import { Notification } from "../modules/NOtifications/Notification.controller";

const tasksService = new TasksService()

export const notificationWorker = new Worker(
    "choir-notifications",
    async (job) => {

        if (job.name === "send-sunday-notification") {

messageLogger(`Sunday job triggered`,`Time  ${new Date()}`)
            TasksController.getNextSundayTasks
  
    if (job.name === "send-sunday-notification") {

      messageLogger(`Sunday job triggered`, `Time ${new Date()}`);

      // ✅ CALL SERVICE (not controller)
      const tasks = await tasksService.fetchNextTasks();

      if (!tasks.task || tasks.task.length === 0) return;

      await Notification.processTask(tasks.task);

      return;
    }
        }
        const { role, tasks } = job.data;
        messageLogger('worker', job.data.userNumber)
        const isRegistered = await whatsappClient.isNumberRegistered(job.data.userNumber);
        messageLogger(`isRegister`, isRegistered)
        var data = {
            to: "2347064795401",
            message: job.data.message
        }
        if (isRegistered === true) {
            await whatsappClient.sendMessage(job.data.userNumber, job.data.message);
            await whatsappClient.sendMessageToGroup(job.data.message)
            await sendSMS(data)
            console.log(`Sent for role: ${role}`);
        }
    },
    // { connection: bullMQconnection }
    { connection: connection }
);


// bullMQconnection