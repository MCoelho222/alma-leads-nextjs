/*
  Warnings:

  - Added the required column `website` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "website" TEXT NOT NULL;
