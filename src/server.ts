import app from "./app";
import dotenv from "dotenv";
dotenv.config();
import { checkDatabaseConnection } from "./config/DBConnection";

const PORT = process.env.PORT || 3000;
console.log("SERVER RESTARTED", Date.now());
app.listen(PORT, async() => {
  await checkDatabaseConnection()
  console.log(`Server running on port ${PORT}`);
});