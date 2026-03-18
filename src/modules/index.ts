import { Router } from "express";
import membersRouter from "./members/Members.route";
import tasksRouter from "./Tasks/Tasks.route";
const router = Router()

router.use("/test", () => {
    console.log("index testing")
})

router.use("/members", membersRouter)
router.use("/tasks", tasksRouter)

export default router