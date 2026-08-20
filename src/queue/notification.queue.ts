import { Queue } from "bullmq";
import IORedis from "ioredis";
import { messageLogger } from "../util";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue("choir-notifications", {
  connection,
});

// Which channels a given reminder should go out on.
export type NotificationChannels = {
  dm: boolean;
  group: boolean;
  sms: boolean;
};

// 09113357094
export const addNotificationJob = async (data: {
  message: any;
  userNumber: any;
  role?: string;
  channels?: NotificationChannels;
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
  messageLogger(`addNotificationJob job run`,`${JSON.stringify(data)}`)
};
