import { Router } from "express";
import { db, leaguesTable, teamsTable, playersTable, picksTable, draftStateTable } from "@workspace/db";
import { eq, and, notInArray, asc, desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

function getSnakePickTeamIndex(overallPick: number, numTeams: number): number {
  const round = Math.ceil(overallPick / numTeams);
  const pickInRound = ((overallPick - 1) % numTeams) + 1;
  if (round % 2 === 1) {
    return pickInRound - 1;
  } else {
    return numTeams - pickInRound;
  }
}

router.get("/leagues/:leagueId/draft", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const [state] = await db.select().from(draftStateTable).where(eq(draftStateTable.leagueId, leagueId));
    if (!state) {
      const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId));
      if (!league) return res.status(404).json({ error: "League not found" });
      return res.json({
        leagueId,
        status: "not_started",
        currentOverallPick: 1,
        currentRound: 1,
        currentPickInRound: 1,
        onTheClockTeamId: null,
        totalPicks: league.numTeams * league.numRounds,
        timerSecondsRemaining: null,
        lastPickId: null,
      });
    }
    const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId));
    res.json({
      leagueId: state.leagueId,
      status: state.status,
      currentOverallPick: state.currentOverallPick,
      currentRound: state.currentRound,
      currentPickInRound: state.currentPickInRound,
      onTheClockTeamId: state.onTheClockTeamId,
      totalPicks: league ? league.numTeams * league.numRounds : 0,
      timerSecondsRemaining: league?.timerSeconds ?? null,
      lastPickId: state.lastPickId,
    });
  } catch (err) {
    logger.error({ err }, "Failed to get draft state");
    res.status(500).json({ error: "Failed to get draft state" });
  }
});

router.post("/leagues/:leagueId/draft/start", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId));
    if (!league) return res.status(404).json({ error: "League not found" });

    const teams = await db.select().from(teamsTable).where(eq(teamsTable.leagueId, leagueId)).orderBy(teamsTable.draftPosition);
    if (teams.length === 0) return res.status(400).json({ error: "No teams in league" });

    const firstTeam = teams[0];
    const existing = await db.select().from(draftStateTable).where(eq(draftStateTable.leagueId, leagueId));

    let state;
    if (existing.length > 0) {
      const [updated] = await db.update(draftStateTable).set({
        status: "active",
        currentOverallPick: 1,
        currentRound: 1,
        currentPickInRound: 1,
        onTheClockTeamId: firstTeam.id,
        updatedAt: new Date(),
      }).where(eq(draftStateTable.leagueId, leagueId)).returning();
      state = updated;
    } else {
      const [created] = await db.insert(draftStateTable).values({
        leagueId,
        status: "active",
        currentOverallPick: 1,
        currentRound: 1,
        currentPickInRound: 1,
        onTheClockTeamId: firstTeam.id,
      }).returning();
      state = created;
    }

    await db.update(leaguesTable).set({ status: "drafting" }).where(eq(leaguesTable.id, leagueId));

    res.json({
      leagueId: state.leagueId,
      status: state.status,
      currentOverallPick: state.currentOverallPick,
      currentRound: state.currentRound,
      currentPickInRound: state.currentPickInRound,
      onTheClockTeamId: state.onTheClockTeamId,
      totalPicks: league.numTeams * league.numRounds,
      timerSecondsRemaining: league.timerSeconds,
      lastPickId: state.lastPickId,
    });
  } catch (err) {
    logger.error({ err }, "Failed to start draft");
    res.status(500).json({ error: "Failed to start draft" });
  }
});

router.post("/leagues/:leagueId/draft/pause", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const [state] = await db.select().from(draftStateTable).where(eq(draftStateTable.leagueId, leagueId));
    if (!state) return res.status(404).json({ error: "Draft not found" });
    const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId));

    const newStatus = state.status === "active" ? "paused" : "active";
    const [updated] = await db.update(draftStateTable).set({ status: newStatus, updatedAt: new Date() }).where(eq(draftStateTable.leagueId, leagueId)).returning();

    res.json({
      leagueId: updated.leagueId,
      status: updated.status,
      currentOverallPick: updated.currentOverallPick,
      currentRound: updated.currentRound,
      currentPickInRound: updated.currentPickInRound,
      onTheClockTeamId: updated.onTheClockTeamId,
      totalPicks: league ? league.numTeams * league.numRounds : 0,
      timerSecondsRemaining: league?.timerSeconds ?? null,
      lastPickId: updated.lastPickId,
    });
  } catch (err) {
    logger.error({ err }, "Failed to pause draft");
    res.status(500).json({ error: "Failed to pause draft" });
  }
});

router.get("/leagues/:leagueId/draft/board", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId));
    if (!league) return res.status(404).json({ error: "League not found" });

    const teams = await db.select().from(teamsTable).where(eq(teamsTable.leagueId, leagueId)).orderBy(teamsTable.draftPosition);
    const picks = await db.select({ pick: picksTable, player: playersTable, team: teamsTable })
      .from(picksTable)
      .innerJoin(playersTable, eq(picksTable.playerId, playersTable.id))
      .innerJoin(teamsTable, eq(picksTable.teamId, teamsTable.id))
      .where(eq(picksTable.leagueId, leagueId))
      .orderBy(asc(picksTable.overallPick));

    res.json({
      leagueId,
      rounds: league.numRounds,
      teams: teams.map(t => ({
        id: t.id,
        leagueId: t.leagueId,
        name: t.name,
        ownerName: t.ownerName,
        draftPosition: t.draftPosition,
        logoUrl: t.logoUrl,
        walkUpSong: t.walkUpSong,
        primaryColor: t.primaryColor,
        createdAt: t.createdAt.toISOString(),
      })),
      picks: picks.map(({ pick, player, team }) => ({
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
      })),
    });
  } catch (err) {
    logger.error({ err }, "Failed to get draft board");
    res.status(500).json({ error: "Failed to get draft board" });
  }
});

router.get("/leagues/:leagueId/draft/recommendations", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const [state] = await db.select().from(draftStateTable).where(eq(draftStateTable.leagueId, leagueId));
    const teamId = state?.onTheClockTeamId ?? null;

    const draftedPicks = await db.select({ playerId: picksTable.playerId }).from(picksTable).where(eq(picksTable.leagueId, leagueId));
    const draftedIds = draftedPicks.map(p => p.playerId);

    let availablePlayers;
    if (draftedIds.length > 0) {
      availablePlayers = await db.select().from(playersTable).where(notInArray(playersTable.id, draftedIds)).orderBy(asc(playersTable.rank)).limit(50);
    } else {
      availablePlayers = await db.select().from(playersTable).orderBy(asc(playersTable.rank)).limit(50);
    }

    let teamPicks: typeof picksTable.$inferSelect[] = [];
    if (teamId) {
      teamPicks = await db.select().from(picksTable).where(and(eq(picksTable.leagueId, leagueId), eq(picksTable.teamId, teamId)));
    }

    const teamPlayerIds = teamPicks.map(p => p.playerId);
    let teamPlayers: typeof playersTable.$inferSelect[] = [];
    if (teamPlayerIds.length > 0) {
      teamPlayers = await db.select().from(playersTable).where(notInArray(playersTable.id, teamPlayerIds));
    }

    const posCounts: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 };
    for (const pick of teamPicks) {
      const player = teamPlayers.find(p => p.id === pick.playerId);
      if (player) posCounts[player.position] = (posCounts[player.position] ?? 0) + 1;
    }

    const recommendations = [];
    const top5 = availablePlayers.slice(0, 5);

    if (top5[0]) {
      recommendations.push({
        playerId: top5[0].id,
        playerName: top5[0].name,
        position: top5[0].position,
        reason: `Best available player overall — elite projected points (${top5[0].projectedPoints} pts) and top ${top5[0].rank} ranking`,
        type: "best_pick",
        confidenceScore: 0.95,
      });
    }

    const safePlayer = availablePlayers.find(p => p.status === "active" && p.rank <= 30);
    if (safePlayer) {
      recommendations.push({
        playerId: safePlayer.id,
        playerName: safePlayer.name,
        position: safePlayer.position,
        reason: `Low injury risk, reliable starter — ranked ${safePlayer.rank}, ${safePlayer.projectedPoints} projected points`,
        type: "safest_pick",
        confidenceScore: 0.88,
      });
    }

    const upsidePlayer = availablePlayers.find(p => p.projectedPoints > 200 && (p.status === "active" || p.status === "questionable"));
    if (upsidePlayer) {
      recommendations.push({
        playerId: upsidePlayer.id,
        playerName: upsidePlayer.name,
        position: upsidePlayer.position,
        reason: `High ceiling play — ${upsidePlayer.projectedPoints} projected points in a high-volume offense`,
        type: "highest_upside",
        confidenceScore: 0.78,
      });
    }

    const stealPlayer = availablePlayers.find(p => p.adp > p.rank + 5);
    if (stealPlayer) {
      recommendations.push({
        playerId: stealPlayer.id,
        playerName: stealPlayer.name,
        position: stealPlayer.position,
        reason: `Value pick — ADP ${stealPlayer.adp.toFixed(1)} but ranked ${stealPlayer.rank}, drafting ${(stealPlayer.adp - stealPlayer.rank).toFixed(0)} spots early`,
        type: "biggest_steal",
        confidenceScore: 0.82,
      });
    }

    const needPositions = ["QB", "RB", "WR", "TE"].filter(pos => (posCounts[pos] ?? 0) < 2);
    if (needPositions.length > 0) {
      const needPlayer = availablePlayers.find(p => needPositions.includes(p.position));
      if (needPlayer) {
        recommendations.push({
          playerId: needPlayer.id,
          playerName: needPlayer.name,
          position: needPlayer.position,
          reason: `Fills a critical positional need — only ${posCounts[needPlayer.position] ?? 0} ${needPlayer.position}s on roster`,
          type: "positional_need",
          confidenceScore: 0.85,
        });
      }
    }

    const currentPick = state?.currentOverallPick ?? 1;
    const pickPhase = currentPick <= 36 ? "early" : currentPick <= 108 ? "middle" : "late";
    const analysis = teamId
      ? `Round ${state?.currentRound ?? 1}, Pick ${currentPick} — ${pickPhase} draft phase. ${needPositions.length > 0 ? `Prioritize ${needPositions.slice(0, 2).join(", ")}. ` : "Roster balance is good. "}Top available players cluster around the ${top5[0]?.position ?? "skill"} position.`
      : "Waiting for draft to begin.";

    res.json({ teamId, analysis, recommendations: recommendations.slice(0, 5) });
  } catch (err) {
    logger.error({ err }, "Failed to get draft recommendations");
    res.status(500).json({ error: "Failed to get draft recommendations" });
  }
});

router.get("/leagues/:leagueId/draft/grades", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const teams = await db.select().from(teamsTable).where(eq(teamsTable.leagueId, leagueId)).orderBy(teamsTable.draftPosition);

    const grades = await Promise.all(teams.map(async (team) => {
      const picks = await db.select({ pick: picksTable, player: playersTable })
        .from(picksTable)
        .innerJoin(playersTable, eq(picksTable.playerId, playersTable.id))
        .where(and(eq(picksTable.leagueId, leagueId), eq(picksTable.teamId, team.id)));

      if (picks.length === 0) {
        return { teamId: team.id, teamName: team.name, overallGrade: "N/A", gradeScore: 0, summary: "No picks yet", positionalGrades: {} };
      }

      let totalValue = 0;
      const posCounts: Record<string, number> = {};
      for (const { pick, player } of picks) {
        const value = pick.valueScore ?? (player.adp - player.rank) / 10;
        totalValue += value;
        posCounts[player.position] = (posCounts[player.position] ?? 0) + 1;
      }
      const avgValue = totalValue / picks.length;

      let overallGrade: string;
      let gradeScore: number;
      if (avgValue >= 1.5) { overallGrade = "A+"; gradeScore = 97; }
      else if (avgValue >= 0.8) { overallGrade = "A"; gradeScore = 93; }
      else if (avgValue >= 0.3) { overallGrade = "B+"; gradeScore = 87; }
      else if (avgValue >= -0.2) { overallGrade = "B"; gradeScore = 82; }
      else if (avgValue >= -0.7) { overallGrade = "C+"; gradeScore = 77; }
      else if (avgValue >= -1.2) { overallGrade = "C"; gradeScore = 72; }
      else { overallGrade = "D"; gradeScore = 62; }

      const positionalGrades: Record<string, string> = {};
      for (const [pos, count] of Object.entries(posCounts)) {
        if (count >= 3) positionalGrades[pos] = "A";
        else if (count >= 2) positionalGrades[pos] = "B";
        else positionalGrades[pos] = "C";
      }

      const summary = `${team.name} has drafted ${picks.length} players. ${avgValue > 0 ? "Strong value on picks overall." : "Some reaches, but manageable."} ${Object.entries(posCounts).map(([p, c]) => `${c} ${p}`).join(", ")}.`;

      return { teamId: team.id, teamName: team.name, overallGrade, gradeScore, summary, positionalGrades };
    }));

    res.json(grades);
  } catch (err) {
    logger.error({ err }, "Failed to get draft grades");
    res.status(500).json({ error: "Failed to get draft grades" });
  }
});

router.get("/leagues/:leagueId/draft/activity", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const recentPicks = await db.select({ pick: picksTable, player: playersTable, team: teamsTable })
      .from(picksTable)
      .innerJoin(playersTable, eq(picksTable.playerId, playersTable.id))
      .innerJoin(teamsTable, eq(picksTable.teamId, teamsTable.id))
      .where(eq(picksTable.leagueId, leagueId))
      .orderBy(desc(picksTable.createdAt))
      .limit(20);

    const items = recentPicks.map(({ pick, player, team }, i) => ({
      id: pick.id,
      type: "pick",
      message: `With pick ${pick.overallPick} (Round ${pick.round}, Pick ${pick.pickInRound}), ${team.name} selects ${player.name}`,
      playerName: player.name,
      teamName: team.name,
      grade: pick.grade,
      timestamp: pick.createdAt.toISOString(),
    }));

    res.json(items);
  } catch (err) {
    logger.error({ err }, "Failed to get draft activity");
    res.status(500).json({ error: "Failed to get draft activity" });
  }
});

router.get("/leagues/:leagueId/draft/position-scarcity", async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const draftedPicks = await db.select({ playerId: picksTable.playerId }).from(picksTable).where(eq(picksTable.leagueId, leagueId));
    const draftedIds = draftedPicks.map(p => p.playerId);

    let availablePlayers;
    if (draftedIds.length > 0) {
      availablePlayers = await db.select().from(playersTable).where(notInArray(playersTable.id, draftedIds)).orderBy(asc(playersTable.rank));
    } else {
      availablePlayers = await db.select().from(playersTable).orderBy(asc(playersTable.rank));
    }

    const positions = ["QB", "RB", "WR", "TE", "K", "DEF"];
    const scarcity = positions.map(position => {
      const posPlayers = availablePlayers.filter(p => p.position === position);
      const top10 = posPlayers.filter(p => p.rank <= 10).length;
      const top20 = posPlayers.filter(p => p.rank <= 20).length;
      const total = posPlayers.length;

      let scarcityLevel: string;
      if (top10 <= 1) scarcityLevel = "critical";
      else if (top10 <= 3) scarcityLevel = "high";
      else if (top10 <= 6) scarcityLevel = "medium";
      else scarcityLevel = "low";

      return { position, totalAvailable: total, top10Available: top10, top20Available: top20, scarcityLevel };
    });

    res.json(scarcity);
  } catch (err) {
    logger.error({ err }, "Failed to get position scarcity");
    res.status(500).json({ error: "Failed to get position scarcity" });
  }
});

export default router;
