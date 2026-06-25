-- CreateEnum
CREATE TYPE "CreditorType" AS ENUM ('PERSON', 'COMPANY');

-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "creditorName" TEXT,
ADD COLUMN     "creditorType" "CreditorType" NOT NULL DEFAULT 'COMPANY';
