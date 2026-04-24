import fs from "fs";
import path from "path";
// import xlsx from "xlsx";
import * as XLSX from "xlsx";

import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { Prisma, PrismaClient } from "@prisma/client";
import { convertDOB } from "./Helpers";

const prisma = new PrismaClient();

dotenv.config();

/**
 * Excel Row Interface
 */
interface ExcelRow {
  Surname: string;
  Othernames: string;
  Birthday: string;
  PhoneNumber: string;
  Gender: string;
  Part: string;
  Photograph?: string;
}
interface importResult {
  success: boolean,
  processed: ProcessedUser[];
  failed: number
}
/**
 * Processed User Interface
 */
interface ProcessedUser {
  // success: boolean;
  surname: string;
  firstname: string;
  email: string;
  mobileNumber: string;
  gender: string;
  part: string;
  dateOfBirth: string;
  profile_pic: string | null;
}

cloudinary.config({
  // cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  // api_key: process.env.CLOUDINARY_API_KEY as string,
  // api_secret: process.env.CLOUDINARY_API_SECRET as string,

  cloud_name: "djbouuvx3",
  api_key: "846724566362618",
  api_secret: "tkF0FuVwROUarxfdMb_HwueeV2k",
});
async function importExcelData(filePath:Express.Multer.File): Promise<importResult> {
  // const filePath = path.resolve(__dirname, "members_data.xlsx");
  // const filePath = path.resolve(__dirname, "members_data.xlsx");

  try {
    console.log(" Reading Excel File...");
    const workbook = XLSX.read(filePath.buffer, { type: "buffer" });

    // const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    if (jsonData.length === 0) {
      console.log("No data found in Excel file.");

      return {
        success: false,
        processed: [],
        failed: 0
      };
    }

    console.log(`Found ${jsonData.length} records. Processing...`);

    const userPromises = jsonData.map(async (row): Promise<ProcessedUser | null> => {
      try {
        let cloudinaryUrl: string | null = null;

        if (row.Photograph) {
          cloudinaryUrl = await uploadUserPicture(row.Photograph);
        }

        const email =
          `${row.Surname.split(" ")[0].trim().toLowerCase()}${row.Birthday.split("/")[0]
            }@gmail.com`.toLowerCase();

        return {
          surname: row.Surname.trim(),
          firstname: row.Othernames,
          email: email,
          mobileNumber: row.PhoneNumber,
          gender: row.Gender,
          part: row.Part,
          dateOfBirth: row.Birthday,
          profile_pic: cloudinaryUrl,
        };
      } catch (error) {
        console.error("Error processing row:", error);
        return null;
      }
    });

    const processedUsers = await Promise.all(userPromises);

    const validUsers = processedUsers.filter(
      (user): user is ProcessedUser => user !== null
    );
    await prisma.member.createMany({
      data: validUsers.map((user) => ({
        surname: user.surname,
        firstname: user.firstname,
        email: user.email,
        phoneNumber: user.mobileNumber, // ✅ fixed
        gender: user.gender,
        voicePart: user.part,
        dateOfBirth: convertDOB(user.dateOfBirth),
        profile_pic: user.profile_pic
      })),
      skipDuplicates: true
    });
    const result: importResult = {
      success: true,
      processed: validUsers,
      failed: processedUsers.length - validUsers.length
    };

    return result;

  } catch (error) {
    console.error("❌ Error importing Excel data:", error);

    return {
      success: false,
      processed: [],
      failed: 0
    };
  }
}

/**
 * Save processed data to Excel
 */
function saveToExcel(data: ProcessedUser[], fileName: string): void {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    XLSX.writeFile(workbook, fileName);

    console.log(`✅ Successfully saved processed data to ${fileName}`);
  } catch (error) {
    console.error("❌ Error saving to Excel:", error);
  }
}

/**
 * Upload image from Google Drive to Cloudinary
 */
async function uploadUserPicture(driveLink: string): Promise<string | null> {
  try {
    const fileIdMatch = driveLink.match(/id=([^&]+)/);

    if (!fileIdMatch) {
      throw new Error("Invalid Google Drive link format.");
    }

    const fileId = fileIdMatch[1];

    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    console.log("Uploading image...");

    const uploadResponse = await cloudinary.uploader.upload(directUrl, {
      folder: "HTC_DATA",
    });

    console.log("✅ Upload Successful:", uploadResponse.secure_url);

    return uploadResponse.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    return null;
  }
}

export default importExcelData;