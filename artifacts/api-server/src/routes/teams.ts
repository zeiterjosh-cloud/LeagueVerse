import { Router } from "express";
import { db, teamsTable, picksTable, playersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/leagues/:leagueId/teams", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const teams = await db.select().from(teamsTable).where(eq(teamsTable.leagueId, leagueId)).orderBy(teamsTable.draftPosition);
    return res.json(teams.map(formatTeam));
  } catch (err) {
    logger.error({ err }, "Failed to list teams");
    return res.status(500).json({ error: "Failed to list teams" });
  }
});

router.post("/leagues/:leagueId/teams", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const { name, ownerName, draftPosition, logoUrl, walkUpSong, primaryColor } = req.body;
    const [team] = await db.insert(teamsTable).values({
      leagueId,
      name,
      ownerName,
      draftPosition,
      logoUrl: logoUrl ?? null,
      walkUpSong: walkUpSong ?? null,
      primaryColor: primaryColor ?? null,
    }).returning();
    return res.status(201).json(formatTeam(team));
  } catch (err) {
    logger.error({ err }, "Failed to create team");
    return res.status(500).json({ error: "Failed to create team" });
  }
});

router.get("/leagues/:leagueId/teams/:teamId", async (req, res) => {
  try {
    const teamId = Number(req.params.teamId);
    const leagueId = Number(req.params.leagueId);
    const [team] = await db.select().from(teamsTable).where(and(eq(teamsTable.id, teamId), eq(teamsTable.leagueId, leagueId)));
    if (!team) return res.status(404).json({ error: "Team not found" });
    return res.json(formatTeam(team));
  } catch (err) {
    logger.error({ err }, "Failed to get team");
    return res.status(500).json({ error: "Failed to get team" });
  }
});

router.patch("/leagues/:leagueId/teams/:teamId", async (req, res) => {
  try {
    const teamId = Number(req.params.teamId);
    const leagueId = Number(req.params.leagueId);
    const updates: Record<string, unknown> = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.ownerName !== undefined) updates.ownerName = req.body.ownerName;
    if (req.body.logoUrl !== undefined) updates.logoUrl = req.body.logoUrl;
    if (req.body.walkUpSong !== undefined) updates.walkUpSong = req.body.walkUpSong;
    if (req.body.primaryColor !== undefined) updates.primaryColor = req.body.primaryColor;
    const [team] = await db.update(teamsTable).set(updates).where(and(eq(teamsTable.id, teamId), eq(teamsTable.leagueId, leagueId))).returning();
    if (!team) return res.status(404).json({ error: "Team not found" });
    return res.json(formatTeam(team));
  } catch (err) {
    logger.error({ err }, "Failed to update team");
    return res.status(500).json({ error: "Failed to update team" });
  }
});

router.get("/leagues/:leagueId/teams/:teamId/needs", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const teamId = Number(req.params.teamId);

    const picks = await db.select({ pick: picksTable, player: playersTable })
      .from(picksTable)
      .innerJoin(playersTable, eq(picksTable.playerId, playersTable.id))
      .where(and(eq(picksTable.leagueId, leagueId), eq(picksTable.teamId, teamId)));

    const counts: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 };
    for (const { player } of picks) {
      counts[player.position] = (counts[player.position] ?? 0) + 1;
    }

    const targets: Record<string, number> = { QB: 2, RB: 4, WR: 4, TE: 2, K: 1, DEF: 1 };

    const needs = Object.entries(targets).map(([position, target]) => {
      const current = counts[position] ?? 0;
      const diff = target - current;
      let needLevel: string;
      let message: string;
      if (diff <= 0) {
        needLevel = "none";
        message = `${position} depth is solid`;
      } else if (diff === 1) {
        needLevel = "low";
        message = `Could use one more ${position}`;
      } else if (diff === 2) {
        needLevel = "medium";
        message = `${position} depth is thin`;
      } else if (diff === 3) {
        needLevel = "high";
        message = `${position} is a major need`;
      } else {
        needLevel = "critical";
        message = `${position} is critically needed`;
      }
      return { position, needLevel, currentCount: current, targetCount: target, message };
    });

    return res.json({ teamId, needs });
  } catch (err) {
    logger.error({ err }, "Failed to get team needs");
    return res.status(500).json({ error: "Failed to get team needs" });
  }
});

router.get("/leagues/:leagueId/teams/:teamId/roster", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const teamId = Number(req.params.teamId);

    const picks = await db.select({ pick: picksTable, player: playersTable, team: teamsTable })
      .from(picksTable)
      .innerJoin(playersTable, eq(picksTable.playerId, playersTable.id))
      .innerJoin(teamsTable, eq(picksTable.teamId, teamsTable.id))
      .where(and(eq(picksTable.leagueId, leagueId), eq(picksTable.teamId, teamId)))
      .orderBy(picksTable.overallPick);

    return res.json(picks.map(({ pick, player, team }) => formatPick(pick, player, team)));
  } catch (err) {
    logger.error({ err }, "Failed to get team roster");
    return res.status(500).json({ error: "Failed to get team roster" });
  }
});

function formatTeam(team: typeof teamsTable.$inferSelect) {
  return {
    id: team.id,
    leagueId: team.leagueId,
    name: team.name,
    ownerName: team.ownerName,
    draftPosition: team.draftPosition,
    logoUrl: team.logoUrl,
    walkUpSong: team.walkUpSong,
    primaryColor: team.primaryColor,
    createdAt: team.createdAt.toISOString(),
  };
}

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

export { formatTeam, formatPick };
export default router;
