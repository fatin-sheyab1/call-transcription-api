/*
  Warnings:

  - The values [TRANSCRTIBTING,TRANSCRTIBED] on the enum `CallStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CallStatus_new" AS ENUM ('UPLOADED', 'QUEUED', 'TRANSCRIBING', 'TRANSCRIBED', 'ANALYZING', 'COMPLETED', 'FAILED');
ALTER TABLE "public"."Call" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Call" ALTER COLUMN "status" TYPE "CallStatus_new" USING ("status"::text::"CallStatus_new");
ALTER TYPE "CallStatus" RENAME TO "CallStatus_old";
ALTER TYPE "CallStatus_new" RENAME TO "CallStatus";
DROP TYPE "public"."CallStatus_old";
ALTER TABLE "Call" ALTER COLUMN "status" SET DEFAULT 'UPLOADED';
COMMIT;
