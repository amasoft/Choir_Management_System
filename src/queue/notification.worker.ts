// queue/notification.worker.ts
import { Worker } from "bullmq";
import { messageLogger } from "../util";
import { whatsappClient } from "../whatsapp/whatsapp.client";
import { sendSMS } from "../Utils/autoSMS";
import { TasksService } from "../modules/Tasks/Tasks.service";
import { Notification } from "../modules/NOtifications/Notification.controller";
import { connection, NotificationChannels } from "./notification.queue";

const tasksService = new TasksService()

// The 3 trigger job names registered by the scheduler (Monday/Wednesday/
// Saturday reminders). Each one fetches the upcoming Sunday's tasks and
// fans them out into per-member "send-notification" jobs.
const REMINDER_TRIGGER_JOBS = [
    "send-monday-notification",
    "send-wednesday-notification",
    "send-saturday-notification",
    "send-test-notification"
];

export const notificationWorker = new Worker(
    "choir-notifications",
    async (job) => {
messageLogger(`welcome to notificationWorker`,'testing phase ')
        if (REMINDER_TRIGGER_JOBS.includes(job.name)) {
            messageLogger(`Reminder job triggered`, `${job.name} :: Time ${new Date()}`)

            const tasks = await tasksService.fetchNextTasks();

            if (!tasks.task || tasks.task.length === 0) return;

            const channels: NotificationChannels | undefined = job.data.channels;
            await Notification.processTask(tasks.task, channels);

            return;
        }

        // Per-member job created by Notification.processTask
        if (job.name === "send-notification") {
            const { role, channels } = job.data as { role: string; channels?: NotificationChannels };
            messageLogger('worker', job.data.userNumber)
            const isRegistered = await whatsappClient.isNumberRegistered(job.data.userNumber);
            messageLogger(`isRegister`, isRegistered)
            var data = {
                to: job.data.userNumber,
                message: job.data.message
            }
            if (isRegistered === true) {
                if (channels?.dm) {
                    await whatsappClient.sendMessage(job.data.userNumber, job.data.message);
                }
                if (channels?.group) {
                    await whatsappClient.sendMessageToGroup(job.data.message)
                }
                if (channels?.sms) {
                    await sendSMS(data)
                }
                console.log(`Sent for role: ${role}`);
            }
        }
    },
    { connection: connection }
);

// A Node EventEmitter throws (crashing the whole process) if an "error"
// event fires with no listener attached. That used to be a smaller risk
// when this worker ran as its own dedicated process — now that it runs
// inside the same process as the web server, an unhandled worker error
// would take the whole app down with it, so this listener is required.
notificationWorker.on("error", (error) => {
    console.error("Notification worker error:", error);
});
