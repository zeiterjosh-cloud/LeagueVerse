import { Router } from "express";
import { db, leaguesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/leagues", async (req, res) => {
  try {
    const leagues = await db.select().from(leaguesTable).orderBy(leaguesTable.createdAt);
    res.json(leagues.map(formatLeague));
  } catch (err) {
    logger.error({ err }, "Failed to list leagues");
    res.status(500).json({ error: "Failed to list leagues" });
  }
});

router.post("/leagues", async (req, res) => {
  try {
    const { name, commissionerName, numTeams, numRounds, draftType, scoringType, theme, timerSeconds } = req.body;
    const [league] = await db.insert(leaguesTable).values({
      name,
      commissionerName,
      numTeams: numTeams ?? 12,
      numRounds: numRounds ?? 15,
      draftType: draftType ?? "snake",
      scoringType: scoringType ?? "ppr",
      theme: theme ?? "nfl",
      timerSeconds: timerSeconds ?? null,
      status: "setup",
    }).returning();
    res.status(201).json(formatLeague(league));
  } catch (err) {
    logger.error({ err }, "Failed to create league");
    res.status(500).json({ error: "Failed to create league" });
  }
});

router.get("/leagues/:leagueId", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId));
    if (!league) return res.status(404).json({ error: "League not found" });
    res.json(formatLeague(league));
  } catch (err) {
    logger.error({ err }, "Failed to get league");
    res.status(500).json({ error: "Failed to get league" });
  }
});

router.patch("/leagues/:leagueId", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const updates: Record<string, unknown> = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.theme !== undefined) updates.theme = req.body.theme;
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.timerSeconds !== undefined) updates.timerSeconds = req.body.timerSeconds;
    const [league] = await db.update(leaguesTable).set(updates).where(eq(leaguesTable.id, leagueId)).returning();
    if (!league) return res.status(404).json({ error: "League not found" });
    res.json(formatLeague(league));
  } catch (err) {
    logger.error({ err }, "Failed to update league");
    res.status(500).json({ error: "Failed to update league" });
  }
});

router.delete("/leagues/:leagueId", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    await db.delete(leaguesTable).where(eq(leaguesTable.id, leagueId));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete league");
    res.status(500).json({ error: "Failed to delete league" });
  }
});

function formatLeague(league: typeof leaguesTable.$inferSelect) {
  return {
    id: league.id,
    name: league.name,
    commissionerName: league.commissionerName,
    numTeams: league.numTeams,
    numRounds: league.numRounds,
    draftType: league.draftType,
    scoringType: league.scoringType,
    status: league.status,
    theme: league.theme,
    timerSeconds: league.timerSeconds,
    createdAt: league.createdAt.toISOString(),
  };
}

export { formatLeague };
export default router;
