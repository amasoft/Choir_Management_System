// import { bullMQconnection } from './notification.queue';
// queue/notification.worker.ts
import { Worker } from "bullmq";
// import { connection } from "./connection";
import { bullMQconnection } from "./notification.queue";
import { messageLogger } from "../util";
import { whatsappClient } from "../whatsapp/whatsapp.client";
export const notificationWorker = new Worker(
    "choir-notifications",
    async (job) => {
        const { role, tasks } = job.data;
        messageLogger('worker', job.data.userNumber)
        const isRegistered = await whatsappClient.isNumberRegistered(job.data.userNumber);

        if (isRegistered ===true) {
            await whatsappClient.sendMessage(job.data.userNumber, job.data.message);
            await whatsappClient.sendMessageToGroup(job.data.message)
            console.log(`Sent for role: ${role}`);
        }
    },
    { connection: bullMQconnection }
);