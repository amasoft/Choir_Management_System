import { Request, Response, NextFunction } from "express";

import prisma from "../prisma_connection/prisma";

export const checkTasksExist = async (req: Request, res: Response, next: NextFunction) => {

  console.log("Checking if task exists...", req.body);
  try {
    const members_id = req.body.memberId;
    const task_exist = await prisma.task.findFirst({
      where: {
        memberId: members_id,
        isTaskDone: false
      }
    })
    console.log("checkTasksExist Result", JSON.stringify(task_exist));

    if (task_exist) {
      return res.json({
        status: 409,
        message: "This Member Already has a pending task",
      });
    }

    next();
  } catch (error: any) {
    console.log("ProductExist", error.message);
    throw new Error("Error inserting user: " + error.message); // Ensure the error is thrown
  }
};

export const checkMemberExist = async (req: Request, res: Response, next: NextFunction) => {

  console.log("Checking if checkMemeberExist exists...", req.body);
  try {
    const members_id = req.body.memberId;
    const member = await prisma.member.findFirst({
      where: {
        id: members_id,
      }
    })
    console.log("checkMemeberExist results", JSON.stringify(member));

    if (member) {

      return next();
    }
    return res.json({
      status: 409,
      message: "This Member Does not exist",
    });
  } catch (error: any) {
    console.log("ProductExist", error.message);
    throw new Error("Error inserting user: " + error.message); // Ensure the error is thrown
  }
};