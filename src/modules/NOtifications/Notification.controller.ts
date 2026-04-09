import { addNotificationJob } from "../../queue/notification.queue";
import { messageLogger } from "../../util";
import { composeMessage } from "../../Utils/Helpers";
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
  createdAt: Date;
  role: "COMMUNION_SOLO" | "RESPNSORIAL_PASALM";
  member: Member;
}

export class Notification {
  static async processTask(result: Task[]) {
    messageLogger('ProcessTask result:',result)
    try {
      const communionSoloTasks = result.filter((task: Task) => task.role === "COMMUNION_SOLO");
      const responsorialPsalmTasks = result.filter((task: Task) => task.role === "RESPNSORIAL_PASALM");
      const roles = ["COMMUNION_SOLO", "RESPNSORIAL_PASALM"];
      
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
    userNumber: number
    // role,
  });
}


        // const [message, userNumber,cleanPhone_1] = await composeMessage(tasks)
        // messageLogger(`Compose Message:::${userNumber}:${cleanPhone_1}`, message)
        // var data={message,userNumber}
        // await addNotificationJob(data)
      }
      // console.log("COMMUNION_SOLO tasks:", communionSoloTasks.length);
      // console.log("RESPNSORIAL_PASALM tasks:", responsorialPsalmTasks.length);

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
