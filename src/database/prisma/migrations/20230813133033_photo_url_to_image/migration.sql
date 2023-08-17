/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - Added the required column `image` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" RENAME COLUMN "photoURL" TO "image";
ALTER TABLE "User" ALTER COLUMN "image" SET NOT NULL;