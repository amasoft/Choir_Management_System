// whatsappClient.ts
import { Client, LocalAuth } from "whatsapp-web.js";

class WhatsAppClient {
  private static instance: Client;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Client({
        authStrategy: new LocalAuth({
          clientId: "choir-system",
        }),
      });

      this.instance.initialize();
    }

    return this.instance;
  }
}

export const whatsappClient = WhatsAppClient.getInstance();