// import { Client, LocalAuth } from "whatsapp-web.js";
// import qrcode from "qrcode-terminal";
// import { messageLogger } from "../util";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { messageLogger } from "../util";

class WhatsAppClient {
  private client: Client;
  private isReady: boolean = false;
  private    started   : boolean = false;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "choir-system",
      }),
      // puppeteer: {
      //   args: [
      //     "--no-sandbox",
      //     "--disable-setuid-sandbox",
      //     "--disable-dev-shm-usage",
      //   ],
      // },



       puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
      "--no-zygote",
      // This machine has no working IPv6 route, but web.whatsapp.com's DNS
      // record includes an IPv6 address that Chromium tries first — causing
      // navigation to hang until it times out instead of falling back to
      // IPv4 quickly. Forcing IPv4-only avoids that entirely.
      "--disable-ipv6"
    ],
  },
    });
    // Deliberately not started here — see start() below. Constructing this
    // class should be cheap and side-effect-free; launching the actual
    // browser is an explicit step the app boot sequence opts into.
  }

  // ✅ Launch the browser + wire up event listeners. Call this once, explicitly,
  // from app startup (see app.ts) — importing this file must not be enough
  // to spin up a real Chromium process as a hidden side effect.
  public start() {
    if (this.started) return;
    this.started = true;

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
      try {
        await this.client.initialize();
      } catch (err) {
        console.error("❌ Reinitialization error:", err);
      }
    });

    this.client.on("message", async (mesg) => {
      // console.log("📩 Message received from:",+23409099933955 mesg.id.remote+ mesg.body);

      if (mesg.body == "check") {
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
    messageLogger(`waiting`,'loading....')
    if (this.isReady) return;

    return new Promise((resolve) => {
      this.client.once("ready", () => {
        this.isReady = true;
        resolve();
      });
    });
  }

  // ✅ Send message (safe + waits automatically)
  //
  // Deliberately does NOT retry on failure. We've confirmed that a thrown
  // error here doesn't reliably mean "nothing was sent" — client.sendMessage()
  // can successfully deliver the message and still throw while trying to
  // build/return its confirmation (an open whatsapp-web.js compatibility
  // issue with this account). Retrying on an error we can't trust risks a
  // genuine duplicate send to a real person, which is worse than a failure
  // a human can notice and act on from the log.
  public async sendMessage(phone: string, message: string) {
    console.log(`📤 SEND MESSAGE::: ${phone} ::: ${message}`);

    try {
      await this.waitUntilReady(); // ✅ KEY FIX

      const formattedPhone = `${phone}@c.us`;
      return await this.client.sendMessage(formattedPhone, message);
    } catch (error) {
      messageLogger("SendMessage error — NOT auto-retrying (see comment above)", error);
    }
  }

  // "Testing" group's real chat ID, captured once via the message event
  // listener (see the "message" handler above). getChats() — which a
  // name-based lookup would depend on — currently throws for this
  // account/library combination (tracked as an open whatsapp-web.js
  // compatibility issue), so this hardcodes the ID to bypass it entirely
  // rather than depend on a fix. If the group is ever recreated (a new
  // group has a different ID even with the same name), this needs updating.
  private readonly TESTING_GROUP_ID = "120363392575308546@g.us";

  // ✅ Send message to group
  //
  // Deliberately does NOT retry on failure — same reasoning as sendMessage()
  // above. We've directly observed this call deliver a message successfully
  // while its own promise still threw, so a caught error here can't be
  // trusted to mean "nothing sent." Retrying risks a real duplicate message
  // to the whole group.
  public async sendMessageToGroup(message: string) {
    try {
      await this.waitUntilReady();

      console.log("📢 Sending to group:", this.TESTING_GROUP_ID);

      return await this.client.sendMessage(this.TESTING_GROUP_ID, message);
    } catch (error) {
      messageLogger("sendMessageToGroup error — NOT auto-retrying (see comment above)", error);
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