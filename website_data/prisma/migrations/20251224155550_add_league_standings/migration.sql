-- CreateTable
CREATE TABLE "LeagueStandings" (
    "id" SERIAL NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "table" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueStandings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeagueStandings_leagueId_season_key" ON "LeagueStandings"("leagueId", "season");
