/*
  Warnings:

  - You are about to drop the column `images` on the `News` table. All the data in the column will be lost.
  - Added the required column `image` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "images",
ADD COLUMN     "image" VARCHAR(100) NOT NULL;
