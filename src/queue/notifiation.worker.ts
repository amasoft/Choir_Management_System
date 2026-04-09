// import { bullMQconnection } from './notification.queue';
// queue/notification.worker.ts
import { Worker } from "bullmq";
// import { connection } from "./connection";
import { bullMQconnection } from "./notification.queue";
import { messageLogger } from "../util";
import { whatsappClient } from "../whatsapp/whatsapp.client";
import { sendSMS } from "../Utils/autoSMS";
export const notificationWorker = new Worker(
    "choir-notifications",
    async (job) => {
        const { role, tasks } = job.data;
        messageLogger('worker', job.data.userNumber)
        const isRegistered = await whatsappClient.isNumberRegistered(job.data.userNumber);
        messageLogger(`isRegister`,isRegistered)
var data={
    to:"2347064795401",
    message:job.data.message
}
        if (isRegistered ===true) {
            await whatsappClient.sendMessage(job.data.userNumber, job.data.message);
            await whatsappClient.sendMessageToGroup(job.data.message)
            await sendSMS(data)
            console.log(`Sent for role: ${role}`);
        }
    },
    { connection: bullMQconnection }
);