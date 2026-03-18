/*
  Warnings:

  - You are about to drop the column `function` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Task` table. All the data in the column will be lost.
  - Added the required column `notes` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "function",
DROP COLUMN "title",
ADD COLUMN     "isTaskDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT NOT NULL;
