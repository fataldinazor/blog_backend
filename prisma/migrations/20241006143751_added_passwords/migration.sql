/*
  Warnings:

  - Added the required column `password` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "password" VARCHAR(128) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" VARCHAR(128) NOT NULL;
