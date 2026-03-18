import { messageLogger } from "../../util";
import { composeMessage } from "../../Utils/Helpers";
import { whatsappClient } from "../../whatsapp/whatsapp.client";

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
    try {
      // Filter tasks by role
    const communionSoloTasks = result.filter((task: Task) => task.role === "COMMUNION_SOLO");
    const responsorialPsalmTasks = result.filter((task: Task) => task.role === "RESPNSORIAL_PASALM");

    // console.log("COMMUNION_SOLO tasks:", communionSoloTasks.length);
    // console.log("RESPNSORIAL_PASALM tasks:", responsorialPsalmTasks.length);

//+2347063011279
    //check compose message 
    const [message,userNumber] = await composeMessage(communionSoloTasks)
    //send message via whatsapp
    if (!message) {
      console.log("No message to send");
      return;
    }
    const isNumberRegistered=await whatsappClient.isNumberRegistered(userNumber)
    if(isNumberRegistered){
    messageLogger('Sending message-------',`.........`);

      await whatsappClient.sendMessage(userNumber, message);
    }

    messageLogger('getMessage',`message: ${message}::::usernumber:${userNumber}`);
    messageLogger('isNumberRegistered',isNumberRegistered);
    } catch (error) {
      console.log('Notifcation error'+error)
    }
    
  }
}
