/*
  Warnings:

  - You are about to drop the column `countryInterest` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Lead` table. All the data in the column will be lost.
  - Added the required column `categories` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Lead" DROP COLUMN "countryInterest",
DROP COLUMN "location",
ADD COLUMN     "categories" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL;
