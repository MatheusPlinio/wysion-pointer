-- CreateEnum
CREATE TYPE "point_type" AS ENUM ('ENTRY', 'PAUSE_START', 'PAUSE_END', 'EXIT');

-- CreateTable
CREATE TABLE "Register" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "discord_uuid" TEXT NOT NULL,
    "message_uuid" TEXT NOT NULL,
    "point_type" "point_type" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Register_pkey" PRIMARY KEY ("id")
);
