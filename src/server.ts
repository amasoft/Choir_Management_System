// Must run before any other import — app.ts (and everything it pulls in,
// e.g. notification.queue.ts reading process.env.REDIS_URL) is loaded and
// executed the moment it's imported below, so .env needs to already be
// in process.env by then, not after.
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { checkDatabaseConnection } from "./config/DBConnection";
// Starts the BullMQ worker in this same process, so one deploy handles
// both the web server and actually sending reminders — see notification.worker.ts.
import "./queue/notification.worker";

const PORT = process.env.PORT || 3000;
console.log("SERVER RESTARTED", Date.now());
app.listen(PORT, async() => {
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    console.error("Starting without a working database connection.");
  }
  console.log(`Server running on port ${PORT}`);
});

// DATABASE_URL="postgresql://patrick_sales_system:patricksales2025@localhost:5432/HTC_DB?schema=public"
