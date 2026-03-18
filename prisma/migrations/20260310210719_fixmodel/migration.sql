/*
  Warnings:

  - You are about to drop the column `Lastame` on the `Member` table. All the data in the column will be lost.
  - Added the required column `firstname` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "Lastame",
ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "profile_pic" TEXT;
