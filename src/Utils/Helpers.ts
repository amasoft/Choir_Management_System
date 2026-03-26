import { messageLogger } from "../util";

export function convertDOB(dob: string) {
    const [day, month] = dob.split("/");
    const year = 2000; // fallback if year not provided
    const data = new Date(`${year}-${month}-${day}`)
    messageLogger(`convertDOB`, data)
    return data;
}
export function getNextSundayRange(): Date {
    const today = new Date();
    const dayOfWeek = today.getUTCDay(); // 0–6
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;

    const nextSunday = new Date(
        Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate() + daysUntilSunday,
            0,
            0,
            0,
            0
        )
    );

    console.log("Next Sunday:", nextSunday.toISOString());
    return nextSunday;
}

// Get the date of next Sunday at 00:00:00 UTC
function getNextSunday(): Date {
    const today = new Date();
    const dayOfWeek = today.getUTCDay(); // 0–6
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;

    const nextSunday = new Date(
        Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate() + daysUntilSunday,
            0,
            0,
            0,
            0
        )
    );

    console.log("Next Sunday:", nextSunday.toISOString());
    return nextSunday;
}

// export async function composeMessage(params: any) {
//     // messageLogger('composeMessage', params)
//     // messageLogger('composeMessage', params.length)
//     const countOfMembers = params.length

//     switch (countOfMembers) {

//         case 1:
//             const role = params[0].role
//             const user_mobile_number = params[0].member.phoneNumber
//             const cleanPhone = user_mobile_number.replace(/^\+/, "");
//             const due_Date = new Date(params[0].performanceDate)
//             const due_Date_convert = due_Date.toDateString()
//             return singleUser(params[0].member.surname, due_Date_convert, role, cleanPhone)

//         case 2:
           
//             return multiUser(params)

//         default:
//             throw new Error("Unsupported number of members")
//     }

// }
// async function singleUser(name: string, date: string, role: string, userNumber: string) {
//     const message = `Dear ${name}, kindly note that you have a  Liturgical function with the following details:

//   Date: ${date}
//   Function: ${role}

//   We wish you the best!`;
//     return [message, userNumber];
// }
// async function multiUser(params: any) {
//     const user_name_1 = params[0].member.surname
//     const user_name_2 = params[1].member.surname
//     const role = params[0].role

//     const user_mobile_number_1 = params[0].member.phoneNumber
//     const cleanPhone_1 = user_mobile_number_1.replace(/^\+/, "");


//     const user_mobile_number_2 = params[1].member.phoneNumber
//     const cleanPhone_2 = user_mobile_number_2.replace(/^\+/, "");

//     const due_Date = new Date(params[0].performanceDate)
//     const due_Date_convert = due_Date.toDateString()
//     const message = `Dear ${user_name_1},${user_name_2}, kindly note that  both of you have a  Liturgical function(s) with the following details:

//   Date: ${due_Date_convert}
//   Function: ${role}

//   We wish you both the best!`;
//     return [message, cleanPhone_1, cleanPhone_2];
// }

type Task = {
  role: string;
  performanceDate: string | Date;
  member: {
    surname: string;
    phoneNumber: string;
  };
};

// utils
function formatPhone(phone: string): string {
  return phone.replace(/\D/g, ""); // remove everything except digits
}

function formatDate(date: string | Date): string {
  return new Date(date).toDateString();
}

// main function
export async function composeMessage(tasks: Task[]) {
  messageLogger(`composeee`,JSON.stringify(tasks))
  // if (!tasks || tasks.length === 0) {
  if (!tasks || tasks.length <0) {
    throw new Error("No members provided");
  }

  const role = tasks[0].role;
  const dueDate = formatDate(tasks[0].performanceDate);

  const namesArray = tasks.map(t => t.member.surname);
  const phoneNumbers = tasks.map(t => formatPhone(t.member.phoneNumber));

  // format names nicely
  const names =
    namesArray.length === 1
      ? namesArray[0]
      : namesArray.length === 2
      ? `${namesArray[0]} and ${namesArray[1]}`
      : namesArray.join(", ");

  const message =
    namesArray.length === 1
      ? `Dear ${names}, kindly note that you have a Liturgical function with the following details:

Date: ${dueDate}
Function: ${role}

We wish you the best!`
      : `Dear ${names}, kindly note that you have a Liturgical function with the following details:

Date: ${dueDate}
Function: ${role}

We wish you all the best!`;

  return {
    message,
    phoneNumbers,
  };
}