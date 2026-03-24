// import { Client, LocalAuth } from "whatsapp-web.js";
// import qrcode from "qrcode-terminal";
// import { messageLogger } from "../util";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { messageLogger } from "../util";

class WhatsAppClient {
  private client: Client;
  private isReady: boolean = false;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "choir-system",
      }),
      puppeteer: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      },
    });

    this.initialize();
  }

  // ✅ Initialize WhatsApp client safely
  private initialize() {
    this.client.on("qr", (qr) => {
      console.log("📱 Scan the QR code below:");
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      console.log("✅ WhatsApp is ready!");
      this.isReady = true;
    });

    this.client.on("authenticated", () => {
      console.log("🔐 WhatsApp authenticated");
    });

    this.client.on("auth_failure", (msg) => {
      console.error("❌ Authentication failed:", msg);
    });

    // ✅ Auto reconnect on disconnect
    this.client.on("disconnected", async (reason) => {
      console.log("⚠ WhatsApp disconnected:", reason);
      this.isReady = false;

      console.log("🔄 Reinitializing WhatsApp...");
      await this.client.initialize();
    });

    this.client.on("message", async (mesg) => {
      console.log("📩 Message received from:", mesg.id.remote);

      if (mesg.body === "check") {
        const sender = mesg.id.remote.split("@")[0];

        if (sender === "2347064795401") {
          console.log("Checking DB for record...");
        }
      }
    });

    // ✅ Catch initialization crash (important)
    this.client.initialize().catch((err) => {
      console.error("❌ Initialization error:", err);
    });
  }
  public async isNumberRegistered(number:string) {
    // const number = "23407063011279";

    messageLogger(`isNumberRegistered`,number)
      await this.waitUntilReady(); // ✅ KEY FIX

    const isRegistered = await this.client.isRegisteredUser(`${number}@c.us`);

    if (!isRegistered) {
      console.log("User is not on WhatsApp ");
      return false;
    }
    // messageLogger(`isNumberRegistered`,isRegistered)

    return true

  }

  // ✅ Wait until WhatsApp is ready
  public async waitUntilReady(): Promise<void> {
    if (this.isReady) return;

    return new Promise((resolve) => {
      this.client.once("ready", () => {
        this.isReady = true;
        resolve();
      });
    });
  }

  // ✅ Send message (safe + waits automatically)
  public async sendMessage(phone: string, message: string) {
    console.log(`📤 SEND MESSAGE::: ${phone} ::: ${message}`);

    try {
      await this.waitUntilReady(); // ✅ KEY FIX

      const formattedPhone = `${phone}@c.us`;
      return await this.client.sendMessage(formattedPhone, message);
    } catch (error) {
      messageLogger("SendMessage error", error);

      // ✅ Retry once (basic resilience)
      console.log("🔁 Retrying message...");
      await new Promise((res) => setTimeout(res, 2000));

      try {
        const formattedPhone = `${phone}@c.us`;
        return await this.client.sendMessage(formattedPhone, message);
      } catch (retryError) {
        messageLogger("Retry failed", retryError);
      }
    }
  }

  // ✅ Find group safely
  public async findGroupByName(groupName: string) {
    await this.waitUntilReady();

    const chats = await this.client.getChats();

    const group = chats.find(
      (chat) =>
        chat.isGroup &&
        chat.name.toLowerCase() === groupName.toLowerCase()
    );

    if (!group) {
      throw new Error(`Group "${groupName}" not found`);
    }

    return group;
  }

  // ✅ Send message to group
  public async sendMessageToGroup(message: string) {
    try {
      await this.waitUntilReady();

      const group = await this.findGroupByName("Testing");
      const groupId = group.id._serialized;

      console.log("📢 Sending to group:", groupId);

      return await this.client.sendMessage(groupId, message);
    } catch (error) {
      messageLogger("sendMessageToGroup error", error);
    }
  }
}

// ✅ SINGLE instance (important)
export const whatsappClient = new WhatsAppClient();

// ver 1
// class WhatsAppClient {
//   private client: Client;
//   private isReady: boolean = false;

//   constructor() {
//     this.client = new Client({
//       authStrategy: new LocalAuth({
//         clientId: "choir-system", // unique session
//       }),
//       puppeteer: {
//         args: ["--no-sandbox", "--disable-setuid-sandbox","--disable-dev-shm-usage"],
//     //     "--no-sandbox",
//     // "--disable-setuid-sandbox",
//     // "--disable-dev-shm-usage", // 👈 ADD THIS
//       },
//     });

//     this.initialize();
//   }
//   public async getClient() {
//     if (!this.client) {
//       throw new Error("WhatsApp client not ready");

//     }
//     messageLogger('getclient', this.client)
//     return this.client
//   }

//   private initialize() {
//     this.client.on("qr", qr => {
//       console.log("Scan the QR code below:");
//       qrcode.generate(qr, { small: true });
//     });

//     this.client.on("ready", () => {
//       console.log("✅ WhatsApp is ready!");
//       this.isReady = true;
//     });

//     this.client.on("authenticated", () => {
//       console.log("🔐 WhatsApp authenticated");
//     });

//     this.client.on("auth_failure", msg => {
//       console.error("❌ Authentication failed:", msg);
//     });

//     this.client.on("disconnected", reason => {
//       console.log("⚠ WhatsApp disconnected:", reason);
//       this.isReady = false;
//     });

//     this.client.on("message", async mesg => {
//       console.log("Message receieved", mesg.id.remote)
//       if (mesg && mesg.body === 'check') {
//         const sender = mesg.id.remote.split("@")[0]
//         if (sender == '2347064795401')
//           console.log("checking DB for record....")
//       }
//     })

//     this.client.initialize();
//   }
//   public async waitUntilReady(): Promise<void> {
//     if (this.isReady) return;

//     return new Promise((resolve) => {
//       this.client.on("ready", () => {
//         this.isReady = true;
//         resolve();
//       });
//     });
//   }
//   public async sendMessage(phone: string, message: string) {
//     console.log(`SEND MESSAGE:::  ${phone}::::${message}`)
//     try {
//       if (!this.isReady) {
//         throw new Error("WhatsApp client not ready");
//       }
//     // await this.waitUntilReady(); 

//       const formattedPhone = `${phone}@c.us`;
//       return this.client.sendMessage(formattedPhone, message);
//     } catch (error) {
//       messageLogger(`SendMessaege error`, error)
//     }

//   }

// //   public async sendMessage(phone: string, message: string) {
// //   console.log(`SEND MESSAGE:::  ${phone}::::${message}`);

// //   try {
// //     await this.waitUntilReady(); 

// //     const formattedPhone = `${phone}@c.us`;
// //     return this.client.sendMessage(formattedPhone, message);
// //   } catch (error) {
// //     messageLogger(`SendMessage error`, error);
// //   }
// // }

//   public async findGroupByName(groupName: string) {
//     messageLogger('findGroupByName', groupName)

//     if (!this.isReady) {
//       throw new Error("WhatsApp client not ready");
//     }

//     const chats = await this.client.getChats();
//     const group = chats.find(
//       chat => chat.isGroup && chat.name.toLowerCase() === groupName.toLowerCase()
//     );

//     if (!group) {
//       throw new Error(`Group "${groupName}" not found`);
//     }
//     messageLogger('findGroupByName', JSON.stringify(group))

//     return group;
//   }


//   public async sendMessageToGroup(message: string) {
//     const group = await whatsappClient.findGroupByName('Testing')
//     const group_id = group.id._serialized
//     messageLogger('Group ID', group_id)
//     const sendMessage = this.client.sendMessage(group_id, message)
//     console.log(`sendMessageToGroup:::`)
//     return sendMessage
//   }
// }

// export const whatsappClient = new WhatsAppClient();