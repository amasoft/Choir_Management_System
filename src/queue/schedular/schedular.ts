import { messageLogger } from "../../util";
import { notificationQueue } from "../notification.queue";
export const registerScheduler = async () => {
    messageLogger(`registerScheduler`,`welcome to registerScheduler::${new Date()}`)
    await notificationQueue.add(
        "send-sunday-notification",
        {
            type: "sunday"
        },
        {
            repeat: {
                // pattern: "0 9 * * 0", // Sunday 9AM
                pattern: "*/5 * * * *", // every 5 minutes

                tz: "Africa/Lagos"
            },
            removeOnComplete: true,
            removeOnFail: false
        }
    );

    console.log("Scheduler registered");
};