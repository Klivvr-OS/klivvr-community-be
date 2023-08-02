/*
  Warnings:

  - The `likes` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `favoriteClubs` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preferredFoods` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hobbies` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "likes",
ADD COLUMN     "likes" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "favoriteClubs",
ADD COLUMN     "favoriteClubs" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "preferredFoods",
ADD COLUMN     "preferredFoods" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "hobbies",
ADD COLUMN     "hobbies" TEXT[] DEFAULT ARRAY[]::TEXT[];
