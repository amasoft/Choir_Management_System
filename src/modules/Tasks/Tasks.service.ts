import { TaskRepository } from './Tasks.repository';
import importExcelData from "../../Utils/fileutils"
import { getNextSundayRange } from '../../Utils/Helpers';
const tasksRepo = new TaskRepository()
export class TasksService {
    async createTask(data: any) {

        const users = await tasksRepo.createTask(data)
        return {
            users: users
        }
    }
    
     async fetchTasks() {
        const tasks = await tasksRepo.fetchAllTasks()

        return {
            count: tasks.length,
            tasks,

        }
    }
     async fetchNextTasks() {
        const nextSunday=getNextSundayRange()
     const nextTask= await tasksRepo.getNextSundayTask(nextSunday)
     return{
        task:nextTask
     }

    }
    
}