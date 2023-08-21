/*
  Warnings:

  - You are about to drop the column `photoURL` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
-- ALTER TABLE "Post" DROP COLUMN "photoURL",
-- ADD COLUMN     "image" TEXT;
ALTER TABLE "Post" RENAME COLUMN "photoURL" TO "image";
ALTER TABLE "Post" ALTER COLUMN "image" SET DEFAULT '';
ALTER TABLE "Post" ALTER COLUMN "image" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image" DROP DEFAULT;
