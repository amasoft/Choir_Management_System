import { Queue } from "bullmq";
import IORedis from "ioredis";
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const connection = {
  host: redisUrl,
  port: 6379,
  maxRetriesPerRequest: null // ⚠ Must be null for BullMQ
};

export const bullMQconnection = {
  host: redisUrl,
  port: 6379,
  maxRetriesPerRequest: null // ⚠ Must be null for BullMQ
};
// Create Queue
export const notificationQueue = new Queue("choir-notifications", {
  connection,
});

/**
 * Function to add job to queue
 */
export const addNotificationJob = async (data: {
  message: any;
  userNumber: any;
}) => {
  await notificationQueue.add("send-notification", data, {
    attempts: 3, // retry 3 times if fails
    backoff: {
      type: "exponential",
      delay: 2000, // retry delay
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};