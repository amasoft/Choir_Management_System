import app from "./app";
import dotenv from "dotenv";
dotenv.config();
import { checkDatabaseConnection } from "./config/DBConnection";

const PORT = 8080;
console.log("SERVER RESTARTED", Date.now());
app.listen(3000, async() => {
  await checkDatabaseConnection()
  console.log(`Server running on port ${PORT}`);
});