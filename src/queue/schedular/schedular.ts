import { messageLogger } from "../../util";
import { notificationQueue } from "../notification.queue";

// One trigger job per reminder day. Each still fetches tasks for the
// upcoming Sunday (getNextSundayRange works the same no matter what day
// "today" is) — only the day/time it fires and which channels it uses differ.
const REMINDER_SCHEDULE = [
    {
        jobName: "send-monday-notification",
        pattern: "0 9 * * 1", // Monday 9AM
        channels: { dm: true, group: true, sms: true },
    },
    {
        jobName: "send-wednesday-notification",
        pattern: "0 9 * * 3", // Wednesday 9AM
        channels: { dm: true, group: false, sms: true },
    },
    {
        jobName: "send-saturday-notification",
        pattern: "0 9 * * 6", // Saturday 9AM
        channels: { dm: true, group: true, sms: true },
    },
];

export const registerScheduler = async () => {
    messageLogger(`registerScheduler`, `welcome to registerScheduler::${new Date()}`)

    // Remove any stale repeatable jobs (e.g. the old 5-minute test schedule,
    // or the old single Sunday job) so they don't keep firing alongside the
    // new ones — BullMQ won't overwrite/replace them on its own.
    const existingJobs = await notificationQueue.getRepeatableJobs();
    const currentJobNames = REMINDER_SCHEDULE.map(job => job.jobName);
    for (const job of existingJobs) {
        if (!currentJobNames.includes(job.name)) {
            await notificationQueue.removeRepeatableByKey(job.key);
            messageLogger(`registerScheduler`, `Removed stale repeatable job: ${job.name} (${job.pattern})`);
        }
    }

    for (const { jobName, pattern, channels } of REMINDER_SCHEDULE) {
        await notificationQueue.add(
            jobName,
            {
                type: "reminder",
                channels,
            },
            {
                repeat: {
                    pattern,
                    tz: "Africa/Lagos"
                },
                removeOnComplete: true,
                removeOnFail: false
            }
        );
    }

    console.log("Scheduler registered: Monday, Wednesday, Saturday reminders");
};