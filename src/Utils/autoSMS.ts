// import request from "request";

// export const sendNotificationBySMS = async (mobile_number, message) => {
//   console.log("sendNotificationBySMS>>" + message + "  " + mobile_number);

//   var data = {
//     // to: "2347880234567",
//     // to: `${mobile_number}`,/
//     // to: "2348021193234",
//     // to: "2347063011279",
//     to: "2347064795401",

//     // to: mobile_number,
//     from: "HTCSTJOHN",
//     // sms: "Hi there, te
//     // sting Termii",
//     sms: `${message}`,
//     type: "plain",
//     api_key: "TLaxLhkupsqADlgnAfFAdSxaHZCYDGeveHBZDaquKaZqlUnTyjfvsabKehwlvR",
//     channel: "generic",
//     // channel: "dnd",
//     media: {
//       url: "https://media.example.com/file",
//       caption: "your media file",
//     },
//   };
//   // Arinzechukwu09.
//   var options = {
//     method: "POST",
//     // url: "https://BASE_URL/api/sms/send",
//     url: "https://v3.api.termii.com/api/sms/send",
//     headers: {
//       "Content-Type": ["application/json", "application/json"],
//     },
//     body: JSON.stringify(data),
//   };
//   console.log("SMS PAYLOAD" + JSON.stringify(options));
//   request(options, function (error, response) {
//     if (error) throw new Error(error);
//     console.log("new response " + response.body);
//   });
// };


import axios from "axios";
import dotenv from "dotenv";
import { request } from "express";
dotenv.config();

const TERMII_API_KEY = process.env.TERMII_API_KEY!;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID!;

interface SendSMSParams {
  to: string;        // phone number e.g. 2348012345678
  message: string;
}
// console.log(`TERMII_API_KEY :${TERMII_API_KEY},TERMII_SENDER_ID::${TERMII_SENDER_ID}`)
export const sendSMS = async ({ to, message }: SendSMSParams) => {
    console.log("SMS sendSMS:"+to);
  const baseUrl = "https://api.termii.com/api/sms/send";

  // try {
  //   const response = await axios.post(
  //     "https://api.termii.com/api/sms/send",
  //     {
  //       to,
  //       from: TERMII_SENDER_ID,
  //       sms: message,
  //       type: "plain",
  //       channel: "generic",
  //       api_key: TERMII_API_KEY,
  //     }
  //   );

  //   console.log("SMS sent:", response.data);
  //   return response.data;
  // } catch (error: any) {
  //   console.error("Error sending SMS:", error.response?.data || error.message);
  //   throw error;
  // }
  
    // const payload: TermiiSMSPayload = {
    //   to: phone,
    //   from: "talert",
    //   sms: message,
    //   type: "plain",
    //   api_key: this.apiKey,
    //   channel: "generic",
    // };
    const payload={
        to,
        from: TERMII_SENDER_ID,
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: TERMII_API_KEY,
      }

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Termii Error: ${JSON.stringify(data)}`);
      }

      console.log("SMS Sent:", data);
      return data;
    } catch (error: any) {
      console.error("Error sending SMS:", error.message);
      throw error;
    }
  

};