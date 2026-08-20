import { Request, Response, NextFunction } from "express";

import prisma from "../prisma_connection/prisma";
import { createTaskValidator } from "../validators/task.validator";
import { HTTP_STATUS_CODES, STATUS_MESSAGES } from "../Utils/Constants/statusCodes";

// Runs first in the POST /tasks chain, before checkMemberExist/checkTasksExist.
// Rejects a malformed body (missing/invalid memberId, performanceDate, role,
// etc.) immediately, so the DB-existence checks below can safely assume
// req.body.memberId is always a well-formed, present value — never undefined.
export const validateTaskBody = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createTaskValidator.validate(req.body);
  if (error) {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      message: STATUS_MESSAGES.BAD_REQUEST,
      error,
    });
  }
  return next();
};

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
      return res.status(409).json({
        message: "This Member Already has a pending task",
      });
    }

    return next();
  } catch (error: any) {
    console.log("checkTasksExist error", error.message);
    return res.status(500).json({ message: "Error checking existing tasks", error: error.message });
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
    return res.status(409).json({
      message: "This Member Does not exist",
    });
  } catch (error: any) {
    console.log("checkMemberExist error", error.message);
    return res.status(500).json({ message: "Error checking member", error: error.message });
  }
};