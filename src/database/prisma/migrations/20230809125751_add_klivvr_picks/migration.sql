-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PICK_MODERATOR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nominated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "KlivvrPicks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "photoURL" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KlivvrPicks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KlivvrPicks" ADD CONSTRAINT "KlivvrPicks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
