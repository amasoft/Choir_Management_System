import { addNotificationJob, NotificationChannels } from "../../queue/notification.queue";
import { messageLogger } from "../../util";
import { composeMessage } from "../../Utils/Helpers";
import { TaskRepository } from "../Tasks/Tasks.repository";
// import { whatsappClient } from "../../whatsapp/whatsapp.client";

interface Member {
  id: string;
  surname: string;
  firstname: string;
  phoneNumber: string;
  email: string;
  voicePart: string | null;
  isActive: boolean;
  createdAt: Date;
  dateOfBirth: Date | null;
  gender: string;
}

interface Task {
  id: string;
  memberId: string;
  notes: string;
  performanceDate: Date;
  isTaskDone: boolean;
  reminderSent: boolean;
  lastReminderSentAt: Date | null;
  createdAt: Date;
  role: "COMMUNION_SOLO" | "RESPONSORIAL_PSALM";
  member: Member;
}

// Default to every channel when no explicit choice is passed in (e.g. the
// manual /nexttasks endpoint), so existing behaviour doesn't change for it.
const ALL_CHANNELS: NotificationChannels = { dm: true, group: true, sms: true };

const taskRepository = new TaskRepository();

// How long to wait before allowing another reminder for the same task.
// Long enough to never block the real weekly cadence (Monday → Wednesday
// is 2 days apart, Wednesday → Saturday is 3) — short enough to still
// block accidental rapid re-firing (a misconfigured test schedule, a
// duplicate trigger registration) within the same day.
const REMINDER_COOLDOWN_HOURS = 12;

function wasRecentlyReminded(task: Task): boolean {
  if (!task.lastReminderSentAt) return false;
  const hoursSinceLastReminder =
    (Date.now() - new Date(task.lastReminderSentAt).getTime()) / (1000 * 60 * 60);
  return hoursSinceLastReminder < REMINDER_COOLDOWN_HOURS;
}

export class Notification {
  static async processTask(result: Task[], channels: NotificationChannels = ALL_CHANNELS) {
    const roles: Task["role"][] = ["COMMUNION_SOLO", "RESPONSORIAL_PSALM"];
    const errors: unknown[] = [];

    for (const role of roles) {
      // Only tasks matching this role, and not already reminded recently —
      // this is what actually prevents the repeated-resend bug we hit,
      // without blocking the intentional Monday/Wednesday/Saturday cadence.
      const tasks = result.filter(
        (task) => task.role === role && !wasRecentlyReminded(task)
      );

      if (tasks.length === 0) {
        messageLogger("No eligible tasks for role", role);
        continue;
      }

      try {
        const { message, phoneNumbers } = await composeMessage(tasks);

        for (const number of phoneNumbers) {
          await addNotificationJob({ message, userNumber: number, role, channels });
        }

        // Only mark as reminded once every job for this role's tasks has
        // actually been enqueued successfully.
        await taskRepository.markReminderSent(tasks.map((t) => t.id));
      } catch (error) {
        messageLogger(`Failed to process reminders for role ${role}`, error);
        errors.push(error);
      }
    }

    // Rethrown deliberately, after both roles have been attempted —
    // swallowing this entirely would mark the job "completed" in BullMQ
    // even though a send failed, silently losing the automatic retry
    // (3 attempts, exponential backoff) already configured on this queue.
    // Any role that did succeed already marked its tasks as reminded, so a
    // retry only re-attempts the role that actually failed.
    if (errors.length > 0) {
      throw new Error(
        `processTask failed for ${errors.length} role(s): ${errors.map(String).join("; ")}`
      );
    }
  }

  static async processTaskv1(result: Task[], channels: NotificationChannels = ALL_CHANNELS) {
    messageLogger('ProcessTask result:',result)
    try {
      const communionSoloTasks = result.filter((task: Task) => task.role === "COMMUNION_SOLO");
      const responsorialPsalmTasks = result.filter((task: Task) => task.role === "RESPONSORIAL_PSALM");
      const roles = ["COMMUNION_SOLO", "RESPONSORIAL_PSALM"];
      
      for (const role of roles) {
        const tasks = result.filter(task => task.role == role)
          messageLogger('tasks:: tasks', tasks)

        if (tasks.length == 0) {
          messageLogger('No TASK role :: LOOP', role)
          continue
        }

        // messageLogger(' TASKS  :: LOOP', tasks)

const { message, phoneNumbers } = await composeMessage(tasks);

for (const number of phoneNumbers) {
  await addNotificationJob({
    message,
    userNumber: number,
    role,
    channels
  });
}


        // const [message, userNumber,cleanPhone_1] = await composeMessage(tasks)
        // messageLogger(`Compose Message:::${userNumber}:${cleanPhone_1}`, message)
        // var data={message,userNumber}
        // await addNotificationJob(data)
      }
      // console.log("COMMUNION_SOLO tasks:", communionSoloTasks.length);
      // console.log("RESPONSORIAL_PSALM tasks:", responsorialPsalmTasks.length);

      //+2347063011279
      //check compose message 

      // const [message,userNumber] = await composeMessage(task)
      // messageLogger('Compose Message',message)
      // //send message via whatsapp
      // if (!message) {
      //   console.log("No message to send");
      //   return;
      // }
      // const isNumberRegistered=await whatsappClient.isNumberRegistered(userNumber)
      // if(isNumberRegistered){
      // messageLogger('Sending message-------',`.........`);

      //   await whatsappClient.sendMessage(userNumber, message);
      // }

      // messageLogger('getMessage',`message: ${message}::::usernumber:${userNumber}`);
      // messageLogger('isNumberRegistered',isNumberRegistered);
    } catch (error) {
      console.log('Notifcation error' + error)
    }

  }
}
