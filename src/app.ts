import express from "express";
// import { whatsappClient } from "./whatsapp/whatsapp.client";
import { messageLogger } from "./util";
import apiRouter from "./modules"
import importExcelData from "./Utils/fileutils"
import { convertDOB } from "./Utils/Helpers";
import { sendSMS } from "./Utils/autoSMS";
const app = express();
app.use(express.json());




app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
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
  console.log("Server file is running patrick...");
  const { phone, message } = req.body;
  messageLogger(`phone`, phone)
  try {
    // await whatsappClient.sendMessage(phone, message);
    console.log("Server file is running...");
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
});
app.get("/sms", async (req, res) => {
  var data = {
    to: "2347064795401",
    message: "Arinzechukwu"
  }
  console.log('welcome')

  await sendSMS(data)
})
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