import { Router } from "express";
import { db, picksTable, playersTable, teamsTable, leaguesTable, draftStateTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/leagues/:leagueId/picks", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const picks = await db.select({ pick: picksTable, player: playersTable, team: teamsTable })
      .from(picksTable)
      .innerJoin(playersTable, eq(picksTable.playerId, playersTable.id))
      .innerJoin(teamsTable, eq(picksTable.teamId, teamsTable.id))
      .where(eq(picksTable.leagueId, leagueId))
      .orderBy(asc(picksTable.overallPick));

    return res.json(picks.map(({ pick, player, team }) => formatPick(pick, player, team)));
  } catch (err) {
    logger.error({ err }, "Failed to list picks");
    return res.status(500).json({ error: "Failed to list picks" });
  }
});

router.post("/leagues/:leagueId/picks", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const { teamId, playerId } = req.body;

    const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId));
    if (!league) return res.status(404).json({ error: "League not found" });

    const [state] = await db.select().from(draftStateTable).where(eq(draftStateTable.leagueId, leagueId));
    if (!state || state.status !== "active") return res.status(400).json({ error: "Draft is not active" });

    const [player] = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
    if (!player) return res.status(404).json({ error: "Player not found" });

    const existingPick = await db.select().from(picksTable).where(and(eq(picksTable.leagueId, leagueId), eq(picksTable.playerId, playerId)));
    if (existingPick.length > 0) return res.status(400).json({ error: "Player already drafted" });

    const overallPick = state.currentOverallPick;
    const round = state.currentRound;
    const pickInRound = state.currentPickInRound;

    const valueScore = (player.adp - player.rank) / 10;
    let grade: string;
    if (valueScore >= 1.5) grade = "A+";
    else if (valueScore >= 0.8) grade = "A";
    else if (valueScore >= 0.2) grade = "B+";
    else if (valueScore >= -0.3) grade = "B";
    else if (valueScore >= -0.8) grade = "C+";
    else if (valueScore >= -1.3) grade = "C";
    else grade = "D";

    const gradeExplanation = valueScore > 0
      ? `Excellent value — ADP was ${player.adp.toFixed(1)} but ranked ${player.rank}. ${player.projectedPoints} projected points.`
      : `Slight reach — ADP was ${player.adp.toFixed(1)}, ranked ${player.rank}. Still fills a roster need at ${player.position}.`;

    const [pick] = await db.insert(picksTable).values({
      leagueId,
      teamId,
      playerId,
      round,
      pickInRound,
      overallPick,
      grade,
      gradeExplanation,
      valueScore,
    }).returning();

    await db.update(playersTable).set({ isDrafted: true }).where(eq(playersTable.id, playerId));

    const teams = await db.select().from(teamsTable).where(eq(teamsTable.leagueId, leagueId)).orderBy(teamsTable.draftPosition);
    const nextOverall = overallPick + 1;
    const totalPicks = league.numTeams * league.numRounds;

    if (nextOverall > totalPicks) {
      await db.update(draftStateTable).set({
        status: "completed",
        currentOverallPick: nextOverall,
        lastPickId: pick.id,
        onTheClockTeamId: null,
        updatedAt: new Date(),
      }).where(eq(draftStateTable.leagueId, leagueId));
      await db.update(leaguesTable).set({ status: "completed" }).where(eq(leaguesTable.id, leagueId));
    } else {
      const nextRound = Math.ceil(nextOverall / league.numTeams);
      const nextPickInRound = ((nextOverall - 1) % league.numTeams) + 1;

      let nextTeamIndex: number;
      if (league.draftType === "snake") {
        if (nextRound % 2 === 1) {
          nextTeamIndex = nextPickInRound - 1;
        } else {
          nextTeamIndex = league.numTeams - nextPickInRound;
        }
      } else {
        nextTeamIndex = nextPickInRound - 1;
      }

      const nextTeam = teams[nextTeamIndex] ?? teams[0];
      await db.update(draftStateTable).set({
        currentOverallPick: nextOverall,
        currentRound: nextRound,
        currentPickInRound: nextPickInRound,
        onTheClockTeamId: nextTeam.id,
        lastPickId: pick.id,
        updatedAt: new Date(),
      }).where(eq(draftStateTable.leagueId, leagueId));
    }

    const [pickedPlayer] = await db.select().from(playersTable).where(eq(playersTable.id, pick.playerId));
    const [pickedTeam] = await db.select().from(teamsTable).where(eq(teamsTable.id, pick.teamId));

    return res.status(201).json(formatPick(pick, pickedPlayer, pickedTeam));
  } catch (err) {
    logger.error({ err }, "Failed to make pick");
    return res.status(500).json({ error: "Failed to make pick" });
  }
});

router.get("/leagues/:leagueId/picks/:pickId", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const pickId = Number(req.params.pickId);
    const [result] = await db.select({ pick: picksTable, player: playersTable, team: teamsTable })
      .from(picksTable)
      .innerJoin(playersTable, eq(picksTable.playerId, playersTable.id))
      .innerJoin(teamsTable, eq(picksTable.teamId, teamsTable.id))
      .where(and(eq(picksTable.id, pickId), eq(picksTable.leagueId, leagueId)));
    if (!result) return res.status(404).json({ error: "Pick not found" });
    return res.json(formatPick(result.pick, result.player, result.team));
  } catch (err) {
    logger.error({ err }, "Failed to get pick");
    return res.status(500).json({ error: "Failed to get pick" });
  }
});

function formatPick(
  pick: typeof picksTable.$inferSelect,
  player: typeof playersTable.$inferSelect,
  team: typeof teamsTable.$inferSelect
) {
  return {
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
  };
}

export default router;
