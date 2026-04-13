import { Queue } from "bullmq";
import IORedis from "ioredis";
// const redisUrl = process.env.REDIS_URL || "127.0.0.1:6379";

// const connection = {
//   host: redisUrl,
//   port: 6379,
//   maxRetriesPerRequest: null // ⚠ Must be null for BullMQ
// };
// const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";











// import { Queue } from "bullmq";
// import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue("choir-notifications", {
  connection,
});

export const addNotificationJob = async (data: {
  message: any;
  userNumber: any;
}) => {
  await notificationQueue.add("send-notification", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};










// REDIS_URL="redis://${{REDISUSER}}:${{REDIS_PASSWORD}}@${{REDISHOST}}:${{REDISPORT}}
// "
// const redisUrl = process.env.REDIS_URL 

// const connection = new IORedis(process.env.REDIS_URL);
// // export const connection = new IORedis(process.env.REDIS_URL, {
// //   maxRetriesPerRequest: null,
// // });
// export const bullMQconnection = {
//   host: redisUrl,
//   port: 6379,
//   maxRetriesPerRequest: null // ⚠ Must be null for BullMQ
// };

// console.log("REDIS  URL:", redisUrl);
// // Create Queue
// export const notificationQueue = new Queue("choir-notifications", {
//   connection,
// });

// /**
//  * Function to add job to queue
//  */
// export const addNotificationJob = async (data: {
//   message: any;
//   userNumber: any;
// }) => {
//   await notificationQueue.add("send-notification", data, {
//     attempts: 3, // retry 3 times if fails
//     backoff: {
//       type: "exponential",
//       delay: 2000, // retry delay
//     },
//     removeOnComplete: true,
//     removeOnFail: false,
//   });
// };