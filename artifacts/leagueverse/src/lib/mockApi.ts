type LeagueStatus = "setup" | "predraft" | "drafting" | "completed";
type PlayerPosition = "QB" | "RB" | "WR" | "TE" | "K" | "DEF";

type League = {
  id: number;
  name: string;
  commissionerName: string;
  numTeams: number;
  numRounds: number;
  draftType: "snake" | "auction" | "linear";
  scoringType: "standard" | "ppr" | "half_ppr";
  status: LeagueStatus;
  theme: string;
  timerSeconds: number | null;
  createdAt: string;
};

type Team = {
  id: number;
  leagueId: number;
  name: string;
  ownerName: string;
  nickname?: string | null;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  favoriteNflTeam?: string | null;
  mascot?: string | null;
  slogan?: string | null;
  bannerUrl?: string | null;
  record?: string | null;
  walkUpSongUrl?: string | null;
  soundEffectUrl?: string | null;
  draftPersonality?: string | null;
  rivalries?: string | null;
  championshipHistory?: string | null;
  draftPosition: number;
  logoUrl: string | null;
  walkUpSong: string | null;
  primaryColor: string | null;
  createdAt: string;
};

type Player = {
  id: number;
  name: string;
  position: PlayerPosition;
  nflTeam: string;
  rank: number;
  adp: number;
  projectedPoints: number;
  byeWeek: number;
  status: "active" | "questionable" | "out";
  injuryNote: string | null;
  isDrafted: boolean;
};

type Pick = {
  id: number;
  leagueId: number;
  teamId: number;
  playerId: number;
  round: number;
  pickInRound: number;
  overallPick: number;
  grade: string;
  gradeExplanation: string;
  valueScore: number;
  createdAt: string;
};

type MockState = {
  leagues: League[];
  teams: Team[];
  players: Player[];
  picks: Pick[];
  draftState: {
    leagueId: number;
    status: "not_started" | "active" | "paused" | "completed";
    currentOverallPick: number;
    currentRound: number;
    currentPickInRound: number;
    onTheClockTeamId: number | null;
    timerSecondsRemaining: number | null;
    lastPickId: number | null;
  };
};

const storageKey = "leagueverse.mockApi.v4";
const jsonHeaders = { "content-type": "application/json" };
let installed = false;

const now = new Date("2026-08-20T20:00:00.000Z").toISOString();
const walkUpSongs = ["Thunderstruck", "Lose Yourself", "Seven Nation Army", "All I Do Is Win", "Power", "Can't Hold Us"];
const draftPersonalities = ["Value Hunter", "Chaos Trader", "Zero RB Prophet", "Upside Chaser", "Roster Architect", "Risk Merchant"];
const rivalryLines = ["End Zone Empire", "Gridiron Galaxy", "Blitz Brigade", "Waiver Wire Wizards", "Fourth Down Force", "Sunday Savants"];
const championshipLines = ["2023 Finalist, 2025 Champ", "2022 Champ", "Back-to-back semifinalist", "2024 Consolation King", "Three playoff byes", "Expansion-era icon"];

const seedPlayers: Player[] = [
  ["Ja'Marr Chase", "WR", "CIN", 1, 1.2, 335, 10],
  ["Bijan Robinson", "RB", "ATL", 2, 2.1, 318, 5],
  ["Justin Jefferson", "WR", "MIN", 3, 3.3, 312, 6],
  ["Christian McCaffrey", "RB", "SF", 4, 4.5, 306, 14],
  ["CeeDee Lamb", "WR", "DAL", 5, 5.4, 301, 7],
  ["Amon-Ra St. Brown", "WR", "DET", 6, 6.8, 296, 8],
  ["Saquon Barkley", "RB", "PHI", 7, 7.1, 292, 9],
  ["Breece Hall", "RB", "NYJ", 8, 8.7, 286, 9],
  ["Jahmyr Gibbs", "RB", "DET", 9, 9.2, 281, 8],
  ["Tyreek Hill", "WR", "MIA", 10, 10.5, 278, 12],
  ["Puka Nacua", "WR", "LAR", 11, 12.0, 269, 8],
  ["Malik Nabers", "WR", "NYG", 12, 14.2, 264, 14],
  ["A.J. Brown", "WR", "PHI", 13, 13.5, 260, 9],
  ["Jonathan Taylor", "RB", "IND", 14, 15.1, 255, 11],
  ["Josh Allen", "QB", "BUF", 15, 18.4, 372, 7],
  ["Lamar Jackson", "QB", "BAL", 16, 20.0, 365, 7],
  ["Jalen Hurts", "QB", "PHI", 17, 22.5, 356, 9],
  ["Sam LaPorta", "TE", "DET", 18, 24.4, 221, 8],
  ["Trey McBride", "TE", "ARI", 19, 27.2, 215, 8],
  ["Travis Kelce", "TE", "KC", 20, 29.9, 209, 10],
  ["Brandon Aubrey", "K", "DAL", 21, 128.0, 154, 7],
  ["Harrison Butker", "K", "KC", 22, 132.0, 149, 10],
  ["Steelers DST", "DEF", "PIT", 23, 136.0, 144, 5],
  ["Jets DST", "DEF", "NYJ", 24, 140.0, 141, 9],
].map(([name, position, nflTeam, rank, adp, projectedPoints, byeWeek]) => ({
  id: Number(rank),
  name: String(name),
  position: position as PlayerPosition,
  nflTeam: String(nflTeam),
  rank: Number(rank),
  adp: Number(adp),
  projectedPoints: Number(projectedPoints),
  byeWeek: Number(byeWeek),
  status: Number(rank) === 16 || Number(rank) === 19 ? "questionable" : Number(rank) === 20 ? "out" : "active",
  injuryNote: Number(rank) === 16 ? "Knee maintenance" : Number(rank) === 19 ? "Hamstring watch" : Number(rank) === 20 ? "Veteran rest" : null,
  isDrafted: false,
}));

const seedTeams: Team[] = [
  ["Gridiron Galaxy", "Jordan", "The Astronaut", "#16a34a", "GG", "Thunderstruck", "Eagles", "Comets", "Draft beyond gravity", "8-5"],
  ["End Zone Empire", "Casey", "The Closer", "#f59e0b", "EZ", "Lose Yourself", "Chiefs", "Kings", "Rule the red zone", "9-4"],
  ["Waiver Wire Wizards", "Morgan", "The Tactician", "#0ea5e9", "WW", "Seven Nation Army", "Bills", "Wizards", "Magic after kickoff", "7-6"],
  ["Blitz Brigade", "Taylor", "The Hammer", "#ef4444", "BB", "All I Do Is Win", "49ers", "Rhinos", "Pressure breaks brackets", "6-7"],
  ["Sunday Savants", "Riley", "Professor Flex", "#8b5cf6", "SS", "Power", "Ravens", "Owls", "Think fast, draft faster", "10-3"],
  ["Fourth Down Force", "Avery", "The Gambler", "#14b8a6", "4D", "Can't Hold Us", "Lions", "Mavericks", "Never punt the moment", "5-8"],
].map(([name, ownerName, nickname, primaryColor, logoUrl, walkUpSong, favoriteNflTeam, mascot, slogan, record], index) => ({
  id: index + 1,
  leagueId: 1,
  name,
  ownerName,
  nickname,
  bio: `${ownerName} built ${name} around bold draft-room calls, late-round value, and a taste for dramatic walk-up moments.`,
  profilePhotoUrl: initialsFromName(ownerName),
  favoriteNflTeam,
  mascot,
  slogan,
  bannerUrl: `linear:${primaryColor}`,
  record,
  walkUpSongUrl: `mock://${String(walkUpSong).toLowerCase().replaceAll(" ", "-")}`,
  soundEffectUrl: "mock://stadium-hit",
  draftPersonality: draftPersonalities[index % draftPersonalities.length],
  rivalries: rivalryLines[index % rivalryLines.length],
  championshipHistory: championshipLines[index % championshipLines.length],
  draftPosition: index + 1,
  logoUrl,
  walkUpSong,
  primaryColor,
  createdAt: now,
}));

function initialsFromName(name: unknown) {
  return String(name).split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

const syncLeaguePreviews = {
  sleeper: [
    { externalId: "sleeper-991", name: "Sleeper Saturday Sharks", numTeams: 12, numRounds: 16, scoringType: "ppr", draftType: "snake", season: "2026" },
    { externalId: "sleeper-404", name: "Dynasty Trade Lab", numTeams: 10, numRounds: 20, scoringType: "half_ppr", draftType: "snake", season: "2026" },
  ],
  espn: [
    { externalId: "espn-1209", name: "ESPN Primetime League", numTeams: 12, numRounds: 15, scoringType: "ppr", draftType: "snake", season: "2026" },
  ],
  yahoo: [
    { externalId: "yahoo-778", name: "Yahoo Sunday Legends", numTeams: 10, numRounds: 15, scoringType: "half_ppr", draftType: "snake", season: "2026" },
    { externalId: "yahoo-883", name: "Office Trophy Chase", numTeams: 12, numRounds: 14, scoringType: "standard", draftType: "snake", season: "2026" },
  ],
};

function createInitialState(): MockState {
  return {
    leagues: [
      {
        id: 1,
        name: "LeagueVerse Invitational",
        commissionerName: "Alex Morgan",
        numTeams: seedTeams.length,
        numRounds: 5,
        draftType: "snake",
        scoringType: "ppr",
        status: "predraft",
        theme: "nfl",
        timerSeconds: 60,
        createdAt: now,
      },
      {
        id: 2,
        name: "Neon Gridiron Showdown",
        commissionerName: "Sam Rivera",
        numTeams: 10,
        numRounds: 15,
        draftType: "snake",
        scoringType: "half_ppr",
        status: "setup",
        theme: "cyberpunk",
        timerSeconds: 90,
        createdAt: now,
      },
    ],
    teams: seedTeams,
    players: seedPlayers,
    picks: [],
    draftState: {
      leagueId: 1,
      status: "not_started",
      currentOverallPick: 1,
      currentRound: 1,
      currentPickInRound: 1,
      onTheClockTeamId: seedTeams[0]?.id ?? null,
      timerSecondsRemaining: 60,
      lastPickId: null,
    },
  };
}

function createImportedLeague(state: MockState, platform: keyof typeof syncLeaguePreviews, externalId: string) {
  const preview = syncLeaguePreviews[platform].find((item) => item.externalId === externalId) ?? syncLeaguePreviews[platform][0];
  const id = Math.max(...state.leagues.map((item) => item.id), 0) + 1;
  const league: League = {
    id,
    name: preview.name,
    commissionerName: `${platform.toUpperCase()} Import`,
    numTeams: preview.numTeams,
    numRounds: preview.numRounds,
    draftType: preview.draftType as League["draftType"],
    scoringType: preview.scoringType as League["scoringType"],
    status: "predraft",
    theme: platform === "espn" ? "nfl" : platform === "sleeper" ? "cyberpunk" : "vegas",
    timerSeconds: 60,
    createdAt: new Date().toISOString(),
  };
  const importedTeams = Array.from({ length: Math.min(preview.numTeams, 12) }, (_, index) => ({
    id: Math.max(...state.teams.map((item) => item.id), 0) + index + 1,
    leagueId: id,
    name: `${platform.toUpperCase()} Team ${index + 1}`,
    ownerName: `Owner ${index + 1}`,
    nickname: `${platform.toUpperCase()} Ace ${index + 1}`,
    bio: `Imported ${platform} owner with a fresh LeagueVerse franchise profile.`,
    profilePhotoUrl: `${platform[0].toUpperCase()}${index + 1}`,
    favoriteNflTeam: ["Eagles", "Bills", "Chiefs", "Lions", "Ravens", "49ers"][index % 6],
    mascot: ["Sharks", "Hawks", "Wolves", "Dragons", "Bulls", "Mavericks"][index % 6],
    slogan: "Imported and ready",
    bannerUrl: "linear:#16a34a",
    record: `${Math.max(0, 8 - index)}-${Math.min(8, 5 + index)}`,
    draftPosition: index + 1,
    logoUrl: `${platform[0].toUpperCase()}${index + 1}`,
    walkUpSong: walkUpSongs[index % walkUpSongs.length],
    walkUpSongUrl: `mock://${walkUpSongs[index % walkUpSongs.length].toLowerCase().replaceAll(" ", "-")}`,
    soundEffectUrl: "mock://airhorn",
    draftPersonality: draftPersonalities[index % draftPersonalities.length],
    rivalries: `Imported rival ${index + 1}`,
    championshipHistory: index % 3 === 0 ? "Imported league champion" : "Chasing first banner",
    primaryColor: ["#16a34a", "#f59e0b", "#0ea5e9", "#ef4444", "#8b5cf6", "#14b8a6"][index % 6],
    createdAt: new Date().toISOString(),
  }));

  state.leagues.push(league);
  state.teams.push(...importedTeams);
  writeState(state);
  return { ...league, teamsImported: importedTeams.length };
}

function readState(): MockState {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return createInitialState();

  try {
    return JSON.parse(stored) as MockState;
  } catch {
    return createInitialState();
  }
}

function writeState(state: MockState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    ...init,
    headers: { ...jsonHeaders, ...(init?.headers ?? {}) },
  });
}

function noContent() {
  return new Response(null, { status: 204 });
}

function getPath(input: RequestInfo | URL): string | null {
  const raw = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const url = new URL(raw, window.location.origin);
  return url.origin === window.location.origin && url.pathname.startsWith("/api") ? `${url.pathname}${url.search}` : null;
}

async function getBody(input: RequestInfo | URL, init?: RequestInit) {
  const body = init?.body ?? (input instanceof Request ? await input.clone().text() : null);
  if (typeof body !== "string" || body.length === 0) return {};
  return JSON.parse(body) as Record<string, unknown>;
}

function getSnakeTeam(overallPick: number, teams: Team[]) {
  const round = Math.ceil(overallPick / teams.length);
  const pickInRound = ((overallPick - 1) % teams.length) + 1;
  const index = round % 2 === 1 ? pickInRound - 1 : teams.length - pickInRound;
  return teams[index] ?? teams[0];
}

function decoratePick(state: MockState, pick: Pick) {
  return {
    ...pick,
    player: state.players.find((player) => player.id === pick.playerId),
    team: state.teams.find((team) => team.id === pick.teamId),
  };
}

function listAvailablePlayers(state: MockState, params: URLSearchParams) {
  const draftedIds = new Set(state.picks.map((pick) => pick.playerId));
  let players = [...state.players].sort((a, b) => a.rank - b.rank);

  if (params.get("available") === "true") players = players.filter((player) => !draftedIds.has(player.id));
  if (params.get("available") === "false") players = players.filter((player) => draftedIds.has(player.id));
  if (params.get("position")) players = players.filter((player) => player.position === params.get("position"));
  if (params.get("search")) {
    const search = params.get("search")!.toLowerCase();
    players = players.filter((player) => player.name.toLowerCase().includes(search));
  }

  return players;
}

function getDraftState(state: MockState, league: League) {
  return {
    ...state.draftState,
    totalPicks: league.numTeams * league.numRounds,
    timerSecondsRemaining: league.timerSeconds,
  };
}

function advanceDraftAfterPick(state: MockState, league: League, teams: Team[], pick: Pick) {
  const nextOverall = pick.overallPick + 1;
  const totalPicks = league.numTeams * league.numRounds;

  if (nextOverall > totalPicks) {
    league.status = "completed";
    state.draftState = { ...state.draftState, status: "completed", currentOverallPick: nextOverall, lastPickId: pick.id, onTheClockTeamId: null };
    return;
  }

  const nextTeam = getSnakeTeam(nextOverall, teams);
  state.draftState = {
    ...state.draftState,
    status: "active",
    currentOverallPick: nextOverall,
    currentRound: Math.ceil(nextOverall / teams.length),
    currentPickInRound: ((nextOverall - 1) % teams.length) + 1,
    onTheClockTeamId: nextTeam?.id ?? null,
    lastPickId: pick.id,
  };
}

function makeMockPick(state: MockState, league: League, teams: Team[], leagueId: number, teamIdForPick: number, playerId: number) {
  const player = state.players.find((item) => item.id === playerId);
  if (!player) return null;

  const overallPick = state.draftState.currentOverallPick;
  const pick: Pick = {
    id: Math.max(...state.picks.map((item) => item.id), 0) + 1,
    leagueId,
    teamId: teamIdForPick,
    playerId,
    round: Math.ceil(overallPick / teams.length),
    pickInRound: ((overallPick - 1) % teams.length) + 1,
    overallPick,
    grade: player.adp > player.rank + 8 ? "A" : player.status === "questionable" ? "B" : "B+",
    gradeExplanation: `Mock draft value: ADP ${player.adp}, rank ${player.rank}. ${player.injuryNote ? `Risk note: ${player.injuryNote}.` : "Clean health profile."}`,
    valueScore: (player.adp - player.rank) / 10,
    createdAt: new Date().toISOString(),
  };

  state.picks.push(pick);
  player.isDrafted = true;
  advanceDraftAfterPick(state, league, teams, pick);
  return pick;
}

function rewindDraftAfterUndo(state: MockState, league: League, teams: Team[]) {
  const nextOverall = Math.max(1, state.draftState.currentOverallPick - 1);
  const nextTeam = getSnakeTeam(nextOverall, teams);
  league.status = state.picks.length === 0 ? "predraft" : "drafting";
  state.draftState = {
    ...state.draftState,
    status: state.picks.length === 0 ? "not_started" : "active",
    currentOverallPick: nextOverall,
    currentRound: Math.ceil(nextOverall / teams.length),
    currentPickInRound: ((nextOverall - 1) % teams.length) + 1,
    onTheClockTeamId: nextTeam?.id ?? null,
    lastPickId: state.picks.at(-1)?.id ?? null,
  };
}

function teamGrades(state: MockState, leagueId: number) {
  return state.teams
    .filter((team) => team.leagueId === leagueId)
    .map((team) => {
      const picks = state.picks.filter((pick) => pick.teamId === team.id);
      if (picks.length === 0) {
        return { teamId: team.id, teamName: team.name, overallGrade: "N/A", gradeScore: 0, summary: "No picks yet", positionalGrades: {} };
      }

      const positionalGrades = Object.fromEntries(
        picks.map((pick) => {
          const player = state.players.find((candidate) => candidate.id === pick.playerId);
          return [player?.position ?? "FLEX", pick.grade];
        }),
      );

      return {
        teamId: team.id,
        teamName: team.name,
        overallGrade: picks[0]?.grade ?? "B",
        gradeScore: 86,
        summary: `${team.name} has made ${picks.length} sharp value pick${picks.length === 1 ? "" : "s"}.`,
        positionalGrades,
      };
    });
}

async function handleApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  const pathWithSearch = getPath(input);
  if (!pathWithSearch) return null;

  const url = new URL(pathWithSearch, window.location.origin);
  const path = url.pathname;
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const state = readState();
  const segments = path.split("/").filter(Boolean);
  const leagueId = Number(segments[2]);
  const teamId = Number(segments[4]);
  const league = state.leagues.find((item) => item.id === leagueId);
  const teams = state.teams.filter((team) => team.leagueId === leagueId);

  if (method === "GET" && path === "/api/healthz") return json({ ok: true });

  if (method === "GET" && segments[1] === "sync" && segments[2] === "sleeper" && segments[3] === "user") {
    const username = decodeURIComponent(segments[4] ?? "leagueverse");
    return json({ userId: `mock-${username.toLowerCase()}`, username, displayName: username, avatar: null });
  }
  if (method === "GET" && segments[1] === "sync" && segments[2] === "sleeper" && segments[3] === "leagues") {
    return json(syncLeaguePreviews.sleeper);
  }
  if (method === "POST" && path === "/api/sync/sleeper/import") {
    const body = await getBody(input, init);
    return json(createImportedLeague(state, "sleeper", String(body.leagueId ?? "")));
  }
  if (method === "GET" && path === "/api/sync/espn/league") {
    return json(syncLeaguePreviews.espn[0]);
  }
  if (method === "POST" && path === "/api/sync/espn/import") {
    return json(createImportedLeague(state, "espn", syncLeaguePreviews.espn[0].externalId));
  }
  if (method === "GET" && path === "/api/sync/yahoo/auth") {
    return json({ mock: true, state: "mock-yahoo-oauth" });
  }
  if (method === "GET" && segments[1] === "sync" && segments[2] === "yahoo" && segments[3] === "status") {
    return json({ status: "ready" });
  }
  if (method === "GET" && segments[1] === "sync" && segments[2] === "yahoo" && segments[3] === "leagues") {
    return json(syncLeaguePreviews.yahoo);
  }
  if (method === "POST" && path === "/api/sync/yahoo/import") {
    const body = await getBody(input, init);
    return json(createImportedLeague(state, "yahoo", String(body.leagueKey ?? "")));
  }

  if (path === "/api/leagues" && method === "GET") return json(state.leagues);

  if (path === "/api/leagues" && method === "POST") {
    const body = await getBody(input, init);
    const id = Math.max(...state.leagues.map((item) => item.id), 0) + 1;
    const newLeague: League = {
      id,
      name: String(body.name ?? "New League"),
      commissionerName: String(body.commissionerName ?? "Commissioner"),
      numTeams: Number(body.numTeams ?? 12),
      numRounds: Number(body.numRounds ?? 15),
      draftType: (body.draftType as League["draftType"]) ?? "snake",
      scoringType: (body.scoringType as League["scoringType"]) ?? "ppr",
      status: "predraft",
      theme: String(body.theme ?? "nfl"),
      timerSeconds: Number(body.timerSeconds ?? 60),
      createdAt: new Date().toISOString(),
    };

    const newTeams = Array.from({ length: Math.min(newLeague.numTeams, 12) }, (_, index) => ({
      id: Math.max(...state.teams.map((item) => item.id), 0) + index + 1,
      leagueId: id,
      name: `Team ${index + 1}`,
      ownerName: `Owner ${index + 1}`,
      nickname: `Owner ${index + 1}`,
      bio: "A new owner ready to build a franchise identity.",
      profilePhotoUrl: `O${index + 1}`,
      favoriteNflTeam: "TBD",
      mascot: "Rookies",
      slogan: "Build the board",
      bannerUrl: "linear:#16a34a",
      record: "0-0",
      walkUpSongUrl: null,
      soundEffectUrl: null,
      draftPersonality: draftPersonalities[index % draftPersonalities.length],
      rivalries: "TBD",
      championshipHistory: "New franchise",
      draftPosition: index + 1,
      logoUrl: null,
      walkUpSong: null,
      primaryColor: null,
      createdAt: new Date().toISOString(),
    }));

    state.leagues.push(newLeague);
    state.teams.push(...newTeams);
    writeState(state);
    return json(newLeague, { status: 201 });
  }

  if (segments[0] === "api" && segments[1] === "leagues" && league && segments.length === 3) {
    if (method === "GET") return json(league);
    if (method === "PATCH") {
      Object.assign(league, await getBody(input, init));
      writeState(state);
      return json(league);
    }
    if (method === "DELETE") {
      state.leagues = state.leagues.filter((item) => item.id !== league.id);
      writeState(state);
      return noContent();
    }
  }

  if (league && segments[3] === "teams" && segments.length === 4 && method === "GET") return json(teams);
  if (league && segments[3] === "teams" && segments.length === 5 && method === "GET") {
    return json(teams.find((team) => team.id === teamId) ?? { error: "Team not found" }, { status: teams.some((team) => team.id === teamId) ? 200 : 404 });
  }
  if (league && segments[3] === "teams" && segments.length === 5 && method === "PATCH") {
    const team = state.teams.find((item) => item.leagueId === leagueId && item.id === teamId);
    if (!team) return json({ error: "Team not found" }, { status: 404 });
    Object.assign(team, await getBody(input, init));
    writeState(state);
    return json(team);
  }
  if (league && segments[3] === "teams" && segments[5] === "roster" && method === "GET") {
    return json(state.picks.filter((pick) => pick.teamId === teamId).map((pick) => decoratePick(state, pick)));
  }
  if (league && segments[3] === "teams" && segments[5] === "needs" && method === "GET") {
    return json({ teamId, needs: ["QB", "RB", "WR", "TE"].map((position) => ({ position, needLevel: "medium", currentCount: 0, targetCount: 2, message: `Add ${position} depth` })) });
  }

  if (path === "/api/players" && method === "GET") return json(listAvailablePlayers(state, url.searchParams));
  if (segments[0] === "api" && segments[1] === "players" && method === "GET") {
    return json(state.players.find((player) => player.id === Number(segments[2])) ?? { error: "Player not found" });
  }

  if (league && segments[3] === "draft" && segments.length === 4 && method === "GET") return json(getDraftState(state, league));
  if (league && segments[3] === "draft" && segments[4] === "start" && method === "POST") {
    league.status = "drafting";
    state.draftState = { ...state.draftState, leagueId, status: "active", currentOverallPick: 1, currentRound: 1, currentPickInRound: 1, onTheClockTeamId: teams[0]?.id ?? null };
    writeState(state);
    return json(getDraftState(state, league));
  }
  if (league && segments[3] === "draft" && segments[4] === "pause" && method === "POST") {
    state.draftState.status = state.draftState.status === "active" ? "paused" : "active";
    writeState(state);
    return json(getDraftState(state, league));
  }
  if (league && segments[3] === "draft" && segments[4] === "undo" && method === "POST") {
    const pick = state.picks.filter((item) => item.leagueId === leagueId).sort((a, b) => b.overallPick - a.overallPick)[0];
    if (!pick) return json(getDraftState(state, league));
    state.picks = state.picks.filter((item) => item.id !== pick.id);
    const player = state.players.find((item) => item.id === pick.playerId);
    if (player) player.isDrafted = false;
    rewindDraftAfterUndo(state, league, teams);
    writeState(state);
    return json(getDraftState(state, league));
  }
  if (league && segments[3] === "draft" && segments[4] === "assign" && method === "POST") {
    const body = await getBody(input, init);
    const pick = makeMockPick(state, league, teams, leagueId, Number(body.teamId), Number(body.playerId));
    if (!pick) return json({ error: "Player not found" }, { status: 404 });
    writeState(state);
    return json(decoratePick(state, pick), { status: 201 });
  }
  if (league && segments[3] === "draft" && segments[4] === "board" && method === "GET") {
    return json({ leagueId, rounds: league.numRounds, teams, picks: state.picks.filter((pick) => pick.leagueId === leagueId).map((pick) => decoratePick(state, pick)) });
  }
  if (league && segments[3] === "draft" && segments[4] === "recommendations" && method === "GET") {
    const available = listAvailablePlayers(state, new URLSearchParams("available=true")).slice(0, 5);
    return json({
      teamId: state.draftState.onTheClockTeamId,
      analysis: "Mock draft mode is active. Best available, roster balance, and positional scarcity are ready for local testing.",
      recommendations: available.map((player, index) => ({
        playerId: player.id,
        playerName: player.name,
        position: player.position,
        reason: `${player.name} is ranked ${player.rank} with ${player.projectedPoints} projected points.`,
        type: index === 0 ? "best_pick" : "positional_need",
        confidenceScore: 0.9 - index * 0.04,
      })),
    });
  }
  if (league && segments[3] === "draft" && segments[4] === "grades" && method === "GET") return json(teamGrades(state, leagueId));
  if (league && segments[3] === "draft" && segments[4] === "activity" && method === "GET") {
    return json(state.picks.slice(-10).reverse().map((pick) => {
      const decorated = decoratePick(state, pick);
      return { id: pick.id, type: "pick", message: `${decorated.team?.name} selected ${decorated.player?.name}`, playerName: decorated.player?.name, teamName: decorated.team?.name, grade: pick.grade, timestamp: pick.createdAt };
    }));
  }
  if (league && segments[3] === "draft" && segments[4] === "position-scarcity" && method === "GET") {
    const available = listAvailablePlayers(state, new URLSearchParams("available=true"));
    return json(["QB", "RB", "WR", "TE", "K", "DEF"].map((position) => {
      const positionPlayers = available.filter((player) => player.position === position);
      return { position, totalAvailable: positionPlayers.length, top10Available: positionPlayers.filter((player) => player.rank <= 10).length, top20Available: positionPlayers.filter((player) => player.rank <= 20).length, scarcityLevel: positionPlayers.length <= 2 ? "high" : "medium" };
    }));
  }
  if (league && segments[3] === "summary" && method === "GET") {
    return json({ leagueId, totalPicks: league.numTeams * league.numRounds, picksRemaining: league.numTeams * league.numRounds - state.picks.length, completionPercent: 0, topPicksByPosition: {}, recentPicks: state.picks.slice(-5).map((pick) => decoratePick(state, pick)), teamGrades: teamGrades(state, leagueId) });
  }
  if (league && segments[3] === "picks" && segments.length === 4 && method === "GET") {
    return json(state.picks.filter((pick) => pick.leagueId === leagueId).map((pick) => decoratePick(state, pick)));
  }
  if (league && segments[3] === "picks" && segments.length === 4 && method === "POST") {
    const body = await getBody(input, init);
    const playerId = Number(body.playerId);
    const teamIdForPick = Number(body.teamId);
    const pick = makeMockPick(state, league, teams, leagueId, teamIdForPick, playerId);
    if (!pick) return json({ error: "Player not found" }, { status: 404 });
    writeState(state);
    return json(decoratePick(state, pick), { status: 201 });
  }

  return json({ error: "Mock endpoint not found" }, { status: 404 });
}

export function installMockApi() {
  if (installed || !import.meta.env.DEV) return;
  installed = true;

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const mockResponse = await handleApi(input, init);
    return mockResponse ?? realFetch(input, init);
  };
}
