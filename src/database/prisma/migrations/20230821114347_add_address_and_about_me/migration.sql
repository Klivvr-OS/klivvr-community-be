/*
  Warnings:

  - You are about to drop the column `likes` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "image" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "likes",
ADD COLUMN     "aboutMe" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];
