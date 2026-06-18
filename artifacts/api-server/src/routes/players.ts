import { Router } from "express";
import { db, playersTable, picksTable } from "@workspace/db";
import { eq, and, ilike, notInArray, inArray } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/players", async (req, res) => {
  try {
    const { position, available, leagueId, search } = req.query;

    const allPlayers = await db.select().from(playersTable).orderBy(playersTable.rank);

    let result = allPlayers;

    if (position && typeof position === "string") {
      result = result.filter(p => p.position === position);
    }

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    if (leagueId) {
      const leagueIdNum = Number(leagueId);
      const draftedPicks = await db.select({ playerId: picksTable.playerId }).from(picksTable).where(eq(picksTable.leagueId, leagueIdNum));
      const draftedIds = new Set(draftedPicks.map(p => p.playerId));

      if (available === "true") {
        result = result.filter(p => !draftedIds.has(p.id));
      } else if (available === "false") {
        result = result.filter(p => draftedIds.has(p.id));
      }
    }

    return res.json(result.map(formatPlayer));
  } catch (err) {
    logger.error({ err }, "Failed to list players");
    return res.status(500).json({ error: "Failed to list players" });
  }
});

router.get("/players/:playerId", async (req, res) => {
  try {
    const playerId = Number(req.params.playerId);
    const [player] = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
    if (!player) return res.status(404).json({ error: "Player not found" });
    return res.json(formatPlayer(player));
  } catch (err) {
    logger.error({ err }, "Failed to get player");
    return res.status(500).json({ error: "Failed to get player" });
  }
});

function formatPlayer(player: typeof playersTable.$inferSelect) {
  return {
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
  };
}

export { formatPlayer };
export default router;
