/*
  Warnings:

  - You are about to drop the column `eventType` on the `Event` table. All the data in the column will be lost.
  - Added the required column `type` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" RENAME COLUMN "eventType" TO "type";
