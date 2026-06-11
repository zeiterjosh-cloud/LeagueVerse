import { Router } from "express";
import { db, leaguesTable, teamsTable, picksTable, playersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/leagues/:leagueId/summary", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId));
    if (!league) return res.status(404).json({ error: "League not found" });

    const teams = await db.select().from(teamsTable).where(eq(teamsTable.leagueId, leagueId));
    const allPicks = await db.select({ pick: picksTable, player: playersTable, team: teamsTable })
      .from(picksTable)
      .innerJoin(playersTable, eq(picksTable.playerId, playersTable.id))
      .innerJoin(teamsTable, eq(picksTable.teamId, teamsTable.id))
      .where(eq(picksTable.leagueId, leagueId))
      .orderBy(desc(picksTable.createdAt));

    const totalPicks = league.numTeams * league.numRounds;
    const madePicksCount = allPicks.length;
    const picksRemaining = totalPicks - madePicksCount;
    const completionPercent = (madePicksCount / totalPicks) * 100;

    const topPicksByPosition: Record<string, string> = {};
    const positions = ["QB", "RB", "WR", "TE"];
    for (const pos of positions) {
      const topPick = allPicks.find(({ player }) => player.position === pos);
      if (topPick) topPicksByPosition[pos] = topPick.player.name;
    }

    const recentPicks = allPicks.slice(0, 5).map(({ pick, player, team }) => ({
      id: pick.id,
      leagueId: pick.leagueId,
      teamId: pick.teamId,
      playerId: pick.playerId,
      round: pick.round,
      pickInRound: pick.pickInRound,
      overallPick: pick.overallPick,
      grade: pick.grade,
      gradeExplanation: pick.gradeExplanation,
      valueScore: pick.valueScore,
      createdAt: pick.createdAt.toISOString(),
      player: {
        id: player.id,
        name: player.name,
        position: player.position,
        nflTeam: player.nflTeam,
        rank: player.rank,
        adp: player.adp,
        projectedPoints: player.projectedPoints,
        byeWeek: player.byeWeek,
        status: player.status,
        injuryNote: player.injuryNote,
        isDrafted: player.isDrafted,
      },
      team: {
        id: team.id,
        leagueId: team.leagueId,
        name: team.name,
        ownerName: team.ownerName,
        draftPosition: team.draftPosition,
        logoUrl: team.logoUrl,
        walkUpSong: team.walkUpSong,
        primaryColor: team.primaryColor,
        createdAt: team.createdAt.toISOString(),
      },
    }));

    const teamGrades = teams.map(team => {
      const teamPicks = allPicks.filter(({ pick }) => pick.teamId === team.id);
      if (teamPicks.length === 0) {
        return { teamId: team.id, teamName: team.name, overallGrade: "N/A", gradeScore: 0, summary: "No picks yet", positionalGrades: {} };
      }
      const avgValue = teamPicks.reduce((sum, { pick, player }) => sum + (pick.valueScore ?? (player.adp - player.rank) / 10), 0) / teamPicks.length;

      let overallGrade: string;
      let gradeScore: number;
      if (avgValue >= 1.5) { overallGrade = "A+"; gradeScore = 97; }
      else if (avgValue >= 0.8) { overallGrade = "A"; gradeScore = 93; }
      else if (avgValue >= 0.3) { overallGrade = "B+"; gradeScore = 87; }
      else if (avgValue >= -0.2) { overallGrade = "B"; gradeScore = 82; }
      else if (avgValue >= -0.7) { overallGrade = "C+"; gradeScore = 77; }
      else if (avgValue >= -1.2) { overallGrade = "C"; gradeScore = 72; }
      else { overallGrade = "D"; gradeScore = 62; }

      const posCounts: Record<string, number> = {};
      for (const { player } of teamPicks) {
        posCounts[player.position] = (posCounts[player.position] ?? 0) + 1;
      }

      return {
        teamId: team.id,
        teamName: team.name,
        overallGrade,
        gradeScore,
        summary: `${teamPicks.length} picks, avg value ${avgValue.toFixed(2)}`,
        positionalGrades: Object.fromEntries(Object.entries(posCounts).map(([p, c]) => [p, c >= 3 ? "A" : c >= 2 ? "B" : "C"])),
      };
    });

    res.json({ leagueId, totalPicks, picksRemaining, completionPercent, topPicksByPosition, recentPicks, teamGrades });
  } catch (err) {
    logger.error({ err }, "Failed to get league summary");
    res.status(500).json({ error: "Failed to get league summary" });
  }
});

export default router;
