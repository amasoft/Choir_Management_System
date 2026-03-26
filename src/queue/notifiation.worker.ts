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
        // messageLogger('worker', 'welcome to worker   ')
        messageLogger('worker', job.data.userNumber)
        // const response = await composeMessage(tasks);
        // if (!response) return;

        // const [message, userNumber] = response;
        // if (!message || !userNumber) return;

        // const cleanNumber = userNumber.replace('+', '');
        // await whatsappClient.sendMessageToGroup(job.data.message)
        const isRegistered = await whatsappClient.isNumberRegistered(job.data.userNumber);

        if (isRegistered ===true) {
            await whatsappClient.sendMessage(job.data.userNumber, job.data.message);
            await whatsappClient.sendMessageToGroup(job.data.message)
            console.log(`Sent for role: ${role}`);
        }
    },
    { connection: bullMQconnection }
);