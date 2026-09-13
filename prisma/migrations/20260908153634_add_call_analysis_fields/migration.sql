/*
  Warnings:

  - You are about to drop the column `summery` on the `CallAnalysis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CallAnalysis" DROP COLUMN "summery",
ADD COLUMN     "keyTopics" JSONB,
ADD COLUMN     "sentiment" TEXT,
ADD COLUMN     "summary" TEXT,
ALTER COLUMN "pii" DROP NOT NULL;
