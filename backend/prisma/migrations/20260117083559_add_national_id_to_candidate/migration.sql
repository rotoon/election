/*
  Warnings:

  - A unique constraint covering the columns `[national_id]` on the table `candidates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `national_id` to the `candidates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "national_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "candidates_national_id_key" ON "candidates"("national_id");
