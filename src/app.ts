import express from "express";
import { whatsappClient } from "./whatsapp/whatsapp.client";
import { messageLogger } from "./util";
import apiRouter from "./modules"
import importExcelData from "./Utils/fileutils"
import { convertDOB } from "./Utils/Helpers";
const app = express();
app.use(express.json());

app.use("/api/v1", apiRouter)
async function startApp() {
  try {
    console.log("Starting importer...");

    // await importExcelData();

    console.log("Import completed");
  } catch (error) {
    console.error("App error:", error);
  }
}

convertDOB("06/07")
// startApp()
app.post("/api/v1/send-test", async (req, res) => {
  const { phone, message } = req.body;
messageLogger(`phone`,phone)
  try {
    await whatsappClient.sendMessage(phone, message);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
});
app.get("/", async (req, res) => {
  console.log('welcome')
  const { phone, message } = req.body;

  try {

    res.json({ success: true, message: `welcome to HTC Notification system` });
    // const group = await whatsappClient.sendMessageToGroup(message)
    // console.log(`home     ${JSON.stringify(group.getChats())}` )
  } catch (error: any) {
    console.log(`ERROR:${error}`)
    // res.status(500).json({
    //   success: false,
    //   error: error.message,
    // });/
  }
});
export default app;