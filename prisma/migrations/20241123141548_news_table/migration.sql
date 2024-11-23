/*
  Warnings:

  - Made the column `images` on table `News` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "News" ALTER COLUMN "images" SET NOT NULL;
