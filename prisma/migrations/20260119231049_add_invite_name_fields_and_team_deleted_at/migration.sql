/*
  Warnings:

  - Made the column `expiresAt` on table `TeamInvite` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TeamInvite" ALTER COLUMN "expiresAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;
