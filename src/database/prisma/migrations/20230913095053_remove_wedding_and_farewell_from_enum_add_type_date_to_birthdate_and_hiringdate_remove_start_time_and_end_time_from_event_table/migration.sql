/*
  Warnings:

  - The values [WEDDING,FAREWELL] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `endTime` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Event` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('BIRTHDAY', 'ANNIVERSARY');
ALTER TABLE "Event" ALTER COLUMN "eventType" TYPE "EventType_new" USING ("eventType"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ALTER COLUMN "date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "birthdate" SET DATA TYPE DATE,
ALTER COLUMN "hiringDate" SET DATA TYPE DATE;
