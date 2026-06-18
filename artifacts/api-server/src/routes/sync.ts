import { Router } from "express";
import { db, leaguesTable, teamsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import crypto from "crypto";

const router = Router();

const yahooOAuthStore = new Map<string, {
  accessToken?: string;
  error?: string;
  createdAt: number;
}>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of yahooOAuthStore.entries()) {
    if (now - val.createdAt > 15 * 60 * 1000) yahooOAuthStore.delete(key);
  }
}, 60_000);

function inferScoringType(scoringSettings: Record<string, number> | null | undefined): string {
  if (!scoringSettings) return "standard";
  const rec = scoringSettings["rec"] ?? 0;
  if (rec >= 1) return "ppr";
  if (rec >= 0.5) return "half_ppr";
  return "standard";
}

function inferDraftType(settings: Record<string, unknown> | null | undefined): string {
  if (!settings) return "snake";
  if (settings["draft_type"] === "auction") return "auction";
  return "snake";
}

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
    platformSource: league.platformSource,
    externalId: league.externalId,
    createdAt: league.createdAt.toISOString(),
  };
}

function getRedirectUri(req: { headers: { host?: string }; protocol: string }): string {
  const appUrl = process.env["APP_URL"]
    ?? (process.env["REPLIT_DEV_DOMAIN"] ? `https://${process.env["REPLIT_DEV_DOMAIN"]}` : null)
    ?? `${req.protocol}://${req.headers.host}`;
  return `${appUrl}/api/sync/yahoo/callback`;
}

function closePopupHtml(success: boolean, stateOrError: string): string {
  const payload = success
    ? `{ type: 'yahoo-oauth', success: true, state: '${stateOrError}' }`
    : `{ type: 'yahoo-oauth', success: false, error: '${stateOrError.replace(/'/g, "\\'")}' }`;
  return `<!DOCTYPE html><html><body><script>
try { if (window.opener) window.opener.postMessage(${payload}, '*'); } catch(e) {}
setTimeout(() => window.close(), 500);
</script><p>${success ? "Authorization complete — you may close this window." : `Error: ${stateOrError}`}</p></body></html>`;
}

// ─────────────────────────────────────────────
// SLEEPER
// ─────────────────────────────────────────────

router.get("/sync/sleeper/user/:username", async (req, res) => {
  try {
    const r = await fetch(`https://api.sleeper.app/v1/user/${encodeURIComponent(req.params.username)}`);
    if (!r.ok) return res.status(404).json({ error: "Sleeper user not found" });
    const u = await r.json() as Record<string, unknown>;
    if (!u?.user_id) return res.status(404).json({ error: "Sleeper user not found" });
    return res.json({ userId: u.user_id, username: u.username, displayName: u.display_name, avatar: u.avatar });
  } catch (err) {
    logger.error({ err }, "Sleeper user lookup failed");
    return res.status(500).json({ error: "Failed to reach Sleeper API" });
  }
});

router.get("/sync/sleeper/leagues/:userId/:season", async (req, res) => {
  try {
    const { userId, season } = req.params;
    const r = await fetch(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/${season}`);
    if (!r.ok) return res.status(500).json({ error: "Failed to fetch Sleeper leagues" });
    const leagues = await r.json() as Record<string, unknown>[];
    const mapped = (leagues ?? []).map((l) => ({
      externalId: l["league_id"],
      name: l["name"],
      numTeams: (l["total_rosters"] as number) ?? ((l["settings"] as Record<string, unknown>)?.["num_teams"] as number) ?? 10,
      numRounds: ((l["settings"] as Record<string, unknown>)?.["rounds"] as number) ?? 15,
      scoringType: inferScoringType(l["scoring_settings"] as Record<string, number>),
      draftType: inferDraftType(l["settings"] as Record<string, unknown>),
      status: l["status"] === "drafting" ? "drafting" : "predraft",
      season: l["season"],
    }));
    return res.json(mapped);
  } catch (err) {
    logger.error({ err }, "Sleeper leagues fetch failed");
    return res.status(500).json({ error: "Failed to fetch Sleeper leagues" });
  }
});

router.post("/sync/sleeper/import", async (req, res) => {
  try {
    const { leagueId } = req.body as { leagueId: string };
    if (!leagueId) return res.status(400).json({ error: "leagueId required" });

    const [leagueR, usersR, rostersR] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${leagueId}`),
      fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`),
      fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
    ]);

    if (!leagueR.ok) return res.status(404).json({ error: "Sleeper league not found" });

    const [sl, users, rosters] = await Promise.all([
      leagueR.json() as Promise<Record<string, unknown>>,
      usersR.json() as Promise<Record<string, unknown>[]>,
      rostersR.json() as Promise<Record<string, unknown>[]>,
    ]);

    const scoringType = inferScoringType(sl["scoring_settings"] as Record<string, number>);
    const draftType = inferDraftType(sl["settings"] as Record<string, unknown>);
    const commish = (users ?? []).find((u) => u["is_owner"])?.["display_name"] as string
      ?? (users?.[0]?.["display_name"] as string)
      ?? "Commissioner";

    const [league] = await db.insert(leaguesTable).values({
      name: sl["name"] as string,
      commissionerName: commish,
      numTeams: (sl["total_rosters"] as number) ?? 10,
      numRounds: ((sl["settings"] as Record<string, unknown>)?.["rounds"] as number) ?? 15,
      draftType,
      scoringType,
      status: "predraft",
      theme: "nfl",
      platformSource: "sleeper",
      externalId: leagueId,
    }).onConflictDoUpdate({
      target: [leaguesTable.platformSource, leaguesTable.externalId],
      set: {
        name: sl["name"] as string,
        numTeams: (sl["total_rosters"] as number) ?? 10,
        numRounds: ((sl["settings"] as Record<string, unknown>)?.["rounds"] as number) ?? 15,
        scoringType,
        draftType,
      },
    }).returning();

    const userMap: Record<string, Record<string, unknown>> = {};
    for (const u of (users ?? [])) userMap[u["user_id"] as string] = u;

    await db.delete(teamsTable).where(eq(teamsTable.leagueId, league.id));

    const teams = (rosters ?? []).map((roster, i) => {
      const user = userMap[roster["owner_id"] as string];
      const meta = user?.["metadata"] as Record<string, string> | undefined;
      const teamName = meta?.["team_name"] ?? (user?.["display_name"] as string) ?? `Team ${i + 1}`;
      return {
        leagueId: league.id,
        name: teamName,
        ownerName: (user?.["display_name"] as string) ?? `Owner ${i + 1}`,
        draftPosition: (roster["roster_id"] as number) ?? i + 1,
      };
    });

    if (teams.length > 0) await db.insert(teamsTable).values(teams);

    return res.json({ ...formatLeague(league), teamsImported: teams.length });
  } catch (err) {
    logger.error({ err }, "Sleeper import failed");
    return res.status(500).json({ error: "Failed to import Sleeper league" });
  }
});

// ─────────────────────────────────────────────
// ESPN
// ─────────────────────────────────────────────

router.get("/sync/espn/league", async (req, res) => {
  try {
    const { leagueId, season, espnS2, swid } = req.query as Record<string, string>;
    if (!leagueId || !season) return res.status(400).json({ error: "leagueId and season required" });

    const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mSettings`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (espnS2 && swid) headers["Cookie"] = `espn_s2=${espnS2}; SWID=${swid}`;

    const r = await fetch(url, { headers });
    if (!r.ok) {
      if (r.status === 401 || r.status === 403)
        return res.status(401).json({ error: "Private league — provide ESPN S2 and SWID cookies" });
      return res.status(404).json({ error: "ESPN league not found" });
    }

    const data = await r.json() as Record<string, unknown>;
    const settings = data["settings"] as Record<string, unknown> ?? {};
    const scoringItems = ((settings["scoringSettings"] as Record<string, unknown>)?.["scoringItems"] as Record<string, unknown>[]) ?? [];
    const rec = scoringItems.find((s) => s["statId"] === 53)?.["pointsPerOccurrence"] as number ?? 0;
    const scoringType = rec >= 1 ? "ppr" : rec >= 0.5 ? "half_ppr" : "standard";

    const teams = (data["teams"] as Record<string, unknown>[] ?? []).map((t, i) => ({
      name: `${t["location"] ?? ""} ${t["nickname"] ?? ""}`.trim() || `Team ${i + 1}`,
      ownerName: `Owner ${i + 1}`,
      draftPosition: (t["draftDayProjectedRank"] as number) ?? i + 1,
    }));

    return res.json({
      externalId: String(leagueId),
      name: (settings["name"] as string) ?? `ESPN League ${leagueId}`,
      numTeams: (settings["size"] as number) ?? teams.length ?? 10,
      numRounds: ((settings["draftSettings"] as Record<string, unknown>)?.["rounds"] as number) ?? 15,
      scoringType,
      draftType: (settings["draftSettings"] as Record<string, unknown>)?.["type"] === "AUCTION" ? "auction" : "snake",
      teams,
    });
  } catch (err) {
    logger.error({ err }, "ESPN league fetch failed");
    return res.status(500).json({ error: "Failed to reach ESPN Fantasy API" });
  }
});

router.post("/sync/espn/import", async (req, res) => {
  try {
    const { leagueId, season, espnS2, swid } = req.body as Record<string, string>;
    if (!leagueId || !season) return res.status(400).json({ error: "leagueId and season required" });

    const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mSettings&view=mRoster`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (espnS2 && swid) headers["Cookie"] = `espn_s2=${espnS2}; SWID=${swid}`;

    const r = await fetch(url, { headers });
    if (!r.ok) {
      if (r.status === 401 || r.status === 403)
        return res.status(401).json({ error: "Private league — provide ESPN S2 and SWID cookies" });
      return res.status(404).json({ error: "ESPN league not found" });
    }

    const data = await r.json() as Record<string, unknown>;
    const settings = data["settings"] as Record<string, unknown> ?? {};
    const scoringItems = ((settings["scoringSettings"] as Record<string, unknown>)?.["scoringItems"] as Record<string, unknown>[]) ?? [];
    const rec = scoringItems.find((s) => s["statId"] === 53)?.["pointsPerOccurrence"] as number ?? 0;
    const scoringType = rec >= 1 ? "ppr" : rec >= 0.5 ? "half_ppr" : "standard";
    const draftType = (settings["draftSettings"] as Record<string, unknown>)?.["type"] === "AUCTION" ? "auction" : "snake";
    const members = (data["members"] as Record<string, unknown>[]) ?? [];

    const [league] = await db.insert(leaguesTable).values({
      name: (settings["name"] as string) ?? `ESPN League ${leagueId}`,
      commissionerName: (members[0]?.["displayName"] as string) ?? "Commissioner",
      numTeams: (settings["size"] as number) ?? 10,
      numRounds: ((settings["draftSettings"] as Record<string, unknown>)?.["rounds"] as number) ?? 15,
      draftType,
      scoringType,
      status: "predraft",
      theme: "nfl",
      platformSource: "espn",
      externalId: `${season}_${leagueId}`,
    }).onConflictDoUpdate({
      target: [leaguesTable.platformSource, leaguesTable.externalId],
      set: { name: (settings["name"] as string) ?? `ESPN League ${leagueId}`, numTeams: (settings["size"] as number) ?? 10, scoringType, draftType },
    }).returning();

    await db.delete(teamsTable).where(eq(teamsTable.leagueId, league.id));

    const teams = (data["teams"] as Record<string, unknown>[] ?? []).map((t, i) => {
      const ownerEntry = members.find((m) => m["id"] === (t["owners"] as string[])?.[0]);
      return {
        leagueId: league.id,
        name: `${t["location"] ?? ""} ${t["nickname"] ?? ""}`.trim() || `Team ${i + 1}`,
        ownerName: (ownerEntry?.["displayName"] as string) ?? `Owner ${i + 1}`,
        draftPosition: (t["draftDayProjectedRank"] as number) ?? i + 1,
      };
    });

    if (teams.length > 0) await db.insert(teamsTable).values(teams);
    return res.json({ ...formatLeague(league), teamsImported: teams.length });
  } catch (err) {
    logger.error({ err }, "ESPN import failed");
    return res.status(500).json({ error: "Failed to import ESPN league" });
  }
});

// ─────────────────────────────────────────────
// YAHOO (OAuth 2.0)
// ─────────────────────────────────────────────

router.get("/sync/yahoo/auth", (req, res) => {
  const clientId = process.env["YAHOO_CLIENT_ID"];
  if (!clientId) {
    return res.status(503).json({
      error: "Yahoo not configured",
      setup: true,
      message: "Set YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET environment variables. Register your app at https://developer.yahoo.com/apps/",
    });
  }

  const state = crypto.randomBytes(16).toString("hex");
  yahooOAuthStore.set(state, { createdAt: Date.now() });

  const redirectUri = getRedirectUri(req);
  const authUrl = new URL("https://api.login.yahoo.com/oauth2/request_auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "fspt-r");
  authUrl.searchParams.set("state", state);

  return res.json({ authUrl: authUrl.toString(), state });
});

router.get("/sync/yahoo/callback", async (req, res) => {
  const { code, state, error } = req.query as Record<string, string>;

  if (error || !code || !state || !yahooOAuthStore.has(state)) {
    return res.send(closePopupHtml(false, error ?? "Invalid OAuth state"));
  }

  try {
    const clientId = process.env["YAHOO_CLIENT_ID"]!;
    const clientSecret = process.env["YAHOO_CLIENT_SECRET"]!;

    const tokenResp = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        code,
        redirect_uri: getRedirectUri(req),
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResp.ok) {
      yahooOAuthStore.set(state, { error: "Token exchange failed", createdAt: Date.now() });
      return res.send(closePopupHtml(false, "Token exchange failed"));
    }

    const tokens = await tokenResp.json() as Record<string, string>;
    yahooOAuthStore.set(state, { accessToken: tokens["access_token"], createdAt: Date.now() });
    return res.send(closePopupHtml(true, state));
  } catch (err) {
    logger.error({ err }, "Yahoo OAuth callback failed");
    yahooOAuthStore.set(state, { error: "OAuth callback failed", createdAt: Date.now() });
    return res.send(closePopupHtml(false, "OAuth callback failed"));
  }
});

router.get("/sync/yahoo/status/:state", (req, res) => {
  const entry = yahooOAuthStore.get(req.params.state);
  if (!entry) return res.status(404).json({ status: "not_found" });
  if (entry.error) return res.json({ status: "error", error: entry.error });
  if (entry.accessToken) return res.json({ status: "ready" });
  return res.json({ status: "pending" });
});

router.get("/sync/yahoo/leagues/:state", async (req, res) => {
  const entry = yahooOAuthStore.get(req.params.state);
  if (!entry?.accessToken) return res.status(401).json({ error: "Not authenticated" });

  try {
    const r = await fetch(
      "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json",
      { headers: { Authorization: `Bearer ${entry.accessToken}` } },
    );
    if (!r.ok) return res.status(r.status).json({ error: "Failed to fetch Yahoo leagues" });

    const data = await r.json() as Record<string, unknown>;
    const users = (data as Record<string, unknown>)?.["fantasy_content"] as Record<string, unknown>;
    const usersObj = users?.["users"] as Record<string, unknown>;
    const gamesObj = (usersObj?.["0"] as Record<string, unknown>)?.["user"] as unknown[];
    const games = (gamesObj?.[1] as Record<string, unknown>)?.["games"] as Record<string, unknown>;

    const leaguesRaw: Record<string, unknown>[] = [];
    if (games) {
      for (const key of Object.keys(games)) {
        if (key === "count") continue;
        const game = (games[key] as Record<string, unknown>)?.["game"] as unknown[];
        const leaguesData = (game?.[1] as Record<string, unknown>)?.["leagues"] as Record<string, unknown>;
        if (!leaguesData) continue;
        for (const lKey of Object.keys(leaguesData)) {
          if (lKey === "count") continue;
          const l = ((leaguesData[lKey] as Record<string, unknown>)?.["league"] as unknown[])?.[0];
          if (l) leaguesRaw.push(l as Record<string, unknown>);
        }
      }
    }

    return res.json(leaguesRaw.map((l) => ({
      externalId: l["league_key"],
      name: l["name"],
      numTeams: parseInt(String(l["num_teams"])) || 10,
      numRounds: 15,
      scoringType: l["scoring_type"] === "head" ? "standard" : "ppr",
      season: l["season"],
    })));
  } catch (err) {
    logger.error({ err }, "Yahoo leagues fetch failed");
    return res.status(500).json({ error: "Failed to fetch Yahoo leagues" });
  }
});

router.post("/sync/yahoo/import", async (req, res) => {
  const { state, leagueKey } = req.body as { state: string; leagueKey: string };
  const entry = yahooOAuthStore.get(state);
  if (!entry?.accessToken) return res.status(401).json({ error: "Not authenticated" });
  if (!leagueKey) return res.status(400).json({ error: "leagueKey required" });

  try {
    const authHeader = { Authorization: `Bearer ${entry.accessToken}` };
    const [leagueR, teamsR] = await Promise.all([
      fetch(`https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}?format=json`, { headers: authHeader }),
      fetch(`https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/teams?format=json`, { headers: authHeader }),
    ]);

    if (!leagueR.ok) return res.status(404).json({ error: "Yahoo league not found" });

    const [leagueData, teamsData] = await Promise.all([
      leagueR.json() as Promise<Record<string, unknown>>,
      teamsR.json() as Promise<Record<string, unknown>>,
    ]);

    const lRaw = ((leagueData["fantasy_content"] as Record<string, unknown>)?.["league"] as unknown[])?.[0] as Record<string, unknown>;
    const teamsRaw = (((teamsData["fantasy_content"] as Record<string, unknown>)?.["league"] as unknown[])?.[1] as Record<string, unknown>)?.["teams"] as Record<string, unknown>;

    const teamsArr: Record<string, unknown>[] = [];
    if (teamsRaw) {
      for (const key of Object.keys(teamsRaw)) {
        if (key === "count") continue;
        const t = ((teamsRaw[key] as Record<string, unknown>)?.["team"] as unknown[])?.[0];
        if (t) teamsArr.push(t as Record<string, unknown>);
      }
    }

    const [league] = await db.insert(leaguesTable).values({
      name: (lRaw?.["name"] as string) ?? "Yahoo League",
      commissionerName: "Commissioner",
      numTeams: parseInt(String(lRaw?.["num_teams"])) || 10,
      numRounds: 15,
      draftType: "snake",
      scoringType: lRaw?.["scoring_type"] === "head" ? "standard" : "ppr",
      status: "predraft",
      theme: "nfl",
      platformSource: "yahoo",
      externalId: leagueKey,
    }).onConflictDoUpdate({
      target: [leaguesTable.platformSource, leaguesTable.externalId],
      set: { name: (lRaw?.["name"] as string) ?? "Yahoo League", numTeams: parseInt(String(lRaw?.["num_teams"])) || 10 },
    }).returning();

    await db.delete(teamsTable).where(eq(teamsTable.leagueId, league.id));

    const teams = teamsArr.map((t, i) => {
      const tArr = t as unknown as unknown[];
      const nameEntry = Array.isArray(tArr) ? (tArr as Record<string, unknown>[]).find((x) => x?.["name"]) : null;
      return {
        leagueId: league.id,
        name: (nameEntry?.["name"] as string) ?? `Team ${i + 1}`,
        ownerName: `Owner ${i + 1}`,
        draftPosition: i + 1,
      };
    });

    if (teams.length > 0) await db.insert(teamsTable).values(teams);
    return res.json({ ...formatLeague(league), teamsImported: teams.length });
  } catch (err) {
    logger.error({ err }, "Yahoo import failed");
    return res.status(500).json({ error: "Failed to import Yahoo league" });
  }
});

export default router;
