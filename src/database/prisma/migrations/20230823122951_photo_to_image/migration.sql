/*
  Warnings:

  - You are about to drop the column `photoURL` on the `KlivvrPick` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "KlivvrPick" DROP COLUMN "photoURL",
ADD COLUMN     "image" TEXT;
