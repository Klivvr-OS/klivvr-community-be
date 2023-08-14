-- CreateTable
CREATE TABLE "KlivvrPick" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "photoURL" TEXT,
    "nomineeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KlivvrPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KlivvrPickNominee" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "nomineeId" INTEGER NOT NULL,
    "nominatorId" INTEGER NOT NULL,

    CONSTRAINT "KlivvrPickNominee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KlivvrPickNominee_nomineeId_key" ON "KlivvrPickNominee"("nomineeId");

-- AddForeignKey
ALTER TABLE "KlivvrPick" ADD CONSTRAINT "KlivvrPick_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "KlivvrPickNominee"("nomineeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KlivvrPickNominee" ADD CONSTRAINT "KlivvrPickNominee_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KlivvrPickNominee" ADD CONSTRAINT "KlivvrPickNominee_nominatorId_fkey" FOREIGN KEY ("nominatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
