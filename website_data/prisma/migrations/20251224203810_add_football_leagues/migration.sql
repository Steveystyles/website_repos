/*
  Warnings:

  - You are about to drop the `LeagueStandings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LeagueStandings";

-- CreateTable
CREATE TABLE "FootballLeague" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "country" TEXT,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FootballLeague_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootballMeta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FootballMeta_pkey" PRIMARY KEY ("key")
);
