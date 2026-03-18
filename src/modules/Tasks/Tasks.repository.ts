import { start } from "node:repl";
import prisma from "../../prisma_connection/prisma";
import { messageLogger } from "../../util";
export class TaskRepository {
  async fetchAllTasks() {
    const users = await prisma.task
      .findMany({

      })
    return users
  }

  async createTask(data: {
    memberId: string;
    performanceDate: Date;
    notes: string;
    role: "RESPNSORIAL_PASALM" | "COMMUNION_SOLO";
  }) {
    return prisma.task.create({
      data: {
        ...data,
        performanceDate: new Date(data.performanceDate)
      }
    });
  }

  // async getTaskById(id: string) {
  //   const member_id = await prisma.task.findUnique({ where: { memberId: id }, })

  // }

  async getNextSundayTask(nextSunday:Date){
    messageLogger(`startdate`,nextSunday)
  return  prisma.task.findMany({
            where: {
                performanceDate: new Date(nextSunday)
            },
            include:{
              member:true
            }
        });
      }
}