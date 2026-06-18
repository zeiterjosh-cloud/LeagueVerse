import { useParams } from "wouter";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetLeague, getGetLeagueQueryKey,
  useGetDraftBoard, getGetDraftBoardQueryKey,
  useGetDraftState, getGetDraftStateQueryKey,
  useListPlayers, getListPlayersQueryKey,
  useMakePick,
  useGetDraftActivity, getGetDraftActivityQueryKey,
  useGetPositionScarcity, getGetPositionScarcityQueryKey,
  useGetDraftRecommendations, getGetDraftRecommendationsQueryKey,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, AlertTriangle, Bot, Brain, Clock, Crown, Expand, Flame, Maximize2, Megaphone, Music2, Pause, Radio, RotateCcw, Search, ShieldCheck, Sparkles, Star, Swords, Target, Trophy, UserPlus, Volume2, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getResolvedWalkUpAudio, isPlayableAudioUrl } from "@/lib/walkUpSongs";

type RevealPick = {
  round: number;
  pickInRound: number;
  overallPick: number;
  grade: string;
  valueScore: number;
  player?: {
    name: string;
    position: string;
    nflTeam: string;
    adp: number;
    byeWeek: number;
  };
  team?: {
    name: string;
    ownerName?: string | null;
    nickname?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    draftPersonality?: string | null;
    rivalries?: string | null;
    championshipHistory?: string | null;
  };
};

type OwnerProfileTeam = {
  name?: string | null;
  ownerName?: string | null;
  nickname?: string | null;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  favoriteNflTeam?: string | null;
  mascot?: string | null;
  slogan?: string | null;
  bannerUrl?: string | null;
  record?: string | null;
  walkUpSong?: string | null;
  walkUpSongUrl?: string | null;
  soundEffectUrl?: string | null;
  draftPersonality?: string | null;
  rivalries?: string | null;
  championshipHistory?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
};

type QueuePlayer = {
  id: number;
  name: string;
  position: string;
  nflTeam: string;
  rank: number;
  adp: number;
  projectedPoints: number;
  byeWeek: number;
  status: string;
  injuryNote?: string | null;
};

const rosterTargets = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 1,
  Bench: 5,
};

function positionClass(position?: string) {
  return position ? `bg-${position.toLowerCase()}` : "bg-card";
}

function initials(name?: string | null) {
  if (!name) return "LV";
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function normalizeRevealPick(pick: {
  round: number;
  pickInRound: number;
  overallPick: number;
  grade?: string | null;
  valueScore?: number | null;
  player?: RevealPick["player"];
  team?: RevealPick["team"];
}): RevealPick {
  return {
    round: pick.round,
    pickInRound: pick.pickInRound,
    overallPick: pick.overallPick,
    grade: pick.grade ?? "B+",
    valueScore: pick.valueScore ?? 0,
    player: pick.player,
    team: pick.team,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function gradeFromScore(score: number) {
  if (score >= 92) return "A+";
  if (score >= 86) return "A";
  if (score >= 78) return "B+";
  if (score >= 70) return "B";
  if (score >= 62) return "C";
  return "D";
}

function playerRisk(player?: QueuePlayer) {
  if (!player) return 0;
  const injury = player.status === "active" ? 4 : player.status === "questionable" ? 24 : 42;
  const adpRisk = player.adp < player.rank ? 10 : 2;
  const roleRisk = player.position === "K" || player.position === "DEF" ? 14 : 6;
  return clamp(injury + adpRisk + roleRisk, 4, 88);
}

function valueScore(player?: QueuePlayer) {
  if (!player) return 0;
  return clamp(Math.round((player.adp - player.rank) * 3 + player.projectedPoints / 12), 0, 99);
}

function pickReaction(player?: QueuePlayer, team?: OwnerProfileTeam | null, round = 1) {
  if (!player) return "The AI booth is waiting for the player queue to load.";
  const value = valueScore(player);
  if (value >= 24) return `${team?.nickname ?? team?.name ?? "This franchise"} can make a statement here: ${player.name} is a board-value spotlight pick with real championship swing.`;
  if (player.adp < player.rank) return `Reach warning from the booth: ${player.name} is exciting, but the board says patience may pay off.`;
  if (round === 1) return `${player.name} gives this draft room a first-round broadcast moment: safe floor, loud ceiling, instant identity.`;
  return `${player.name} fits the build. The booth likes the role, the projection, and the way it shapes the next tier.`;
}

function postPickReaction(pick: RevealPick) {
  const owner = pick.team?.nickname ?? pick.team?.ownerName ?? pick.team?.name ?? "The franchise";
  if (pick.valueScore >= 1.2) return `${owner} just found value. The room felt that pick immediately.`;
  if (pick.round === 1) return `${owner} brings first-round fireworks. The grade is ${pick.grade}, and the broadcast table is buzzing.`;
  if (pick.player?.position === "K" || pick.player?.position === "DEF") return `${owner} goes specialist. Bold timing, louder conversation.`;
  return `${owner} locks in ${pick.player?.name}. Clean fit, fast reaction, grade ${pick.grade}.`;
}

function getWalkUpAudioSource(team?: OwnerProfileTeam | null) {
  if (!team) return null;
  return getResolvedWalkUpAudio(team.walkUpSong, team.walkUpSongUrl);
}

function playPickRevealSound(firstRound: boolean) {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const notes = firstRound ? [196, 247, 330, 392, 523] : [164, 220, 277, 330];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, context.currentTime + index * 0.11);
    gain.gain.linearRampToValueAtTime(firstRound ? 0.08 : 0.05, context.currentTime + index * 0.11 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + index * 0.11 + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + index * 0.11);
    oscillator.stop(context.currentTime + index * 0.11 + 0.18);
  });
}

export default function DraftBoard() {
  const { id } = useParams();
  const leagueId = Number(id);
  const [searchTerm, setSearchTerm] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [tvMode, setTvMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tv") === "1" || params.get("tv") === "true";
  });
  const [audioStatus, setAudioStatus] = useState("Click Play Walk-Up to start audio.");
  const [localClock, setLocalClock] = useState(60);
  const [timerDraftValue, setTimerDraftValue] = useState(60);
  const [manualTeamId, setManualTeamId] = useState("");
  const [manualPlayerId, setManualPlayerId] = useState("");
  const [recentReveal, setRecentReveal] = useState<RevealPick | null>(null);
  const [showTunnel, setShowTunnel] = useState(false);
  const walkUpAudioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  const { data: league } = useGetLeague(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetLeagueQueryKey(leagueId) },
  });
  const { data: draftState } = useGetDraftState(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetDraftStateQueryKey(leagueId), refetchInterval: 3000 },
  });
  const { data: draftBoard } = useGetDraftBoard(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetDraftBoardQueryKey(leagueId), refetchInterval: 3000 },
  });
  const { data: players } = useListPlayers({ available: true, leagueId, search: searchTerm, position: posFilter || undefined }, {
    query: { enabled: !!leagueId, queryKey: getListPlayersQueryKey({ available: true, leagueId, search: searchTerm, position: posFilter || undefined }) },
  });
  const { data: scarcity } = useGetPositionScarcity(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetPositionScarcityQueryKey(leagueId), refetchInterval: 5000 },
  });
  const { data: activity } = useGetDraftActivity(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetDraftActivityQueryKey(leagueId), refetchInterval: 3000 },
  });
  const { data: recommendations } = useGetDraftRecommendations(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetDraftRecommendationsQueryKey(leagueId) },
  });

  const makePick = useMakePick();

  const onTheClockTeam = useMemo(() => {
    if (!draftState?.onTheClockTeamId || !draftBoard?.teams) return null;
    return draftBoard.teams.find((team) => team.id === draftState.onTheClockTeamId) ?? null;
  }, [draftState, draftBoard]);
  const onTheClockProfile = onTheClockTeam as OwnerProfileTeam | null;

  const aiCards = useMemo(() => {
    const recs = recommendations?.recommendations ?? [];
    const fallback = players ?? [];
    return [
      { label: "Best Pick", icon: Trophy, player: recs[0] ?? fallback[0], copy: recs[0]?.reason ?? "Highest board value available right now.", tone: "text-primary" },
      { label: "Safe Pick", icon: ShieldCheck, player: recs[1] ?? fallback[1], copy: recs[1]?.reason ?? "Stable role and lower volatility profile.", tone: "text-emerald-300" },
      { label: "Sleeper Pick", icon: Sparkles, player: recs[2] ?? fallback[2], copy: recs[2]?.reason ?? "Upside profile that can beat current ADP.", tone: "text-sky-300" },
      { label: "Championship Impact", icon: Star, player: recs[3] ?? fallback[3], copy: recs[3]?.reason ?? "Roster-shaping pick with weekly winning potential.", tone: "text-accent" },
    ];
  }, [players, recommendations]);

  const warRoom = useMemo(() => {
    const queue = ((players ?? []) as QueuePlayer[]).slice().sort((a, b) => a.rank - b.rank);
    const best = queue[0];
    const safe = queue
      .filter((player) => player.status === "active")
      .sort((a, b) => playerRisk(a) - playerRisk(b) || b.projectedPoints - a.projectedPoints)[0] ?? best;
    const sleeper = queue
      .filter((player) => player.adp - player.rank >= 8)
      .sort((a, b) => valueScore(b) - valueScore(a))[0] ?? queue[2] ?? best;
    const risk = queue
      .filter((player) => player.status !== "active" || player.adp < player.rank || player.position === "K" || player.position === "DEF")
      .sort((a, b) => playerRisk(b) - playerRisk(a))[0] ?? queue[3] ?? best;

    const teamPicks = (draftBoard?.picks ?? []).filter((pick) => pick.teamId === draftState?.onTheClockTeamId);
    const counts = teamPicks.reduce<Record<string, number>>((acc, pick) => {
      const position = pick.player?.position ?? "Bench";
      acc[position] = (acc[position] ?? 0) + 1;
      return acc;
    }, {});
    const rbWrTe = (counts.RB ?? 0) + (counts.WR ?? 0) + (counts.TE ?? 0);
    const needs = [
      { pos: "QB", current: counts.QB ?? 0, target: rosterTargets.QB },
      { pos: "RB", current: counts.RB ?? 0, target: rosterTargets.RB },
      { pos: "WR", current: counts.WR ?? 0, target: rosterTargets.WR },
      { pos: "TE", current: counts.TE ?? 0, target: rosterTargets.TE },
      { pos: "FLEX", current: Math.max(0, rbWrTe - 5), target: rosterTargets.FLEX },
      { pos: "Bench", current: Math.max(0, teamPicks.length - 7), target: rosterTargets.Bench },
    ].map((need) => {
      const strength = clamp(Math.round((need.current / need.target) * 100), 0, 100);
      return { ...need, strength, weakness: 100 - strength };
    });

    const currentScore = clamp(72 + teamPicks.length * 2 + (counts.RB ?? 0) * 3 + (counts.WR ?? 0) * 3, 58, 96);
    const bestImpact = best ? clamp(Math.round(valueScore(best) / 7 + best.projectedPoints / 80), 1, 16) : 0;
    const beforeOdds = clamp(10 + teamPicks.length * 1.5 + currentScore / 12, 8, 42);
    const afterOdds = clamp(beforeOdds + bestImpact, beforeOdds, 64);
    const round = draftState?.currentRound ?? 1;

    return {
      best,
      safe,
      sleeper,
      risk,
      needs,
      beforeOdds,
      afterOdds,
      oddsDiff: afterOdds - beforeOdds,
      currentGrade: gradeFromScore(currentScore),
      projectedGrade: gradeFromScore(currentScore + bestImpact * 2),
      confidence: clamp(84 + bestImpact - playerRisk(best) / 6, 62, 98),
      roundAdvice: round <= 2
        ? "Anchor the roster with elite weekly ceiling. Prioritize RB/WR volume over novelty."
        : round <= 6
          ? "Balance value with roster construction. Attack scarce tiers before they collapse."
          : "Swing for upside, handcuff leverage, and playoff-week roles.",
      strategy: best
        ? `${best.name} is the board leader because the ADP gap and projection profile create immediate leverage.`
        : "Waiting for the player queue to load.",
    };
  }, [draftBoard?.picks, draftState?.currentRound, draftState?.onTheClockTeamId, players]);

  const announcerText = useMemo(() => (
    pickReaction(warRoom.best, onTheClockProfile, draftState?.currentRound ?? 1)
  ), [draftState?.currentRound, onTheClockProfile, warRoom.best]);

  useEffect(() => {
    setLocalClock(draftState?.timerSecondsRemaining ?? league?.timerSeconds ?? 60);
    setTimerDraftValue(draftState?.timerSecondsRemaining ?? league?.timerSeconds ?? 60);
  }, [draftState?.currentOverallPick, draftState?.timerSecondsRemaining, league?.timerSeconds]);

  useEffect(() => {
    const interval = window.setInterval(() => setLocalClock((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!onTheClockTeam) return;
    if (new URLSearchParams(window.location.search).get("tunnel") === "0") return;
    setShowTunnel(true);
    const timeout = window.setTimeout(() => setShowTunnel(false), 4200);
    return () => window.clearTimeout(timeout);
  }, [onTheClockTeam?.id]);

  const playWalkUpAudio = async () => {
    const source = getWalkUpAudioSource(onTheClockProfile);
    if (!source) {
      setAudioStatus("No audio URL exists for this team. Add one on the owner profile or choose a demo walk-up song.");
      return;
    }

    try {
      if (!walkUpAudioRef.current) walkUpAudioRef.current = new Audio();
      walkUpAudioRef.current.pause();
      walkUpAudioRef.current.src = source.url;
      walkUpAudioRef.current.volume = 0.8;
      walkUpAudioRef.current.currentTime = 0;
      await walkUpAudioRef.current.play();
      setAudioStatus(`Playing: ${source.label}`);
    } catch {
      setAudioStatus("Audio could not play. Check that the URL is a playable audio file and click Play Walk-Up again.");
    }
  };

  const toggleTvMode = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      setTvMode(true);
    } else {
      await document.exitFullscreen?.();
      setTvMode(false);
    }
  };

  const handlePick = (playerId?: number) => {
    if (!playerId || !draftState?.onTheClockTeamId) return;
    makePick.mutate(
      { leagueId, data: { teamId: draftState.onTheClockTeamId, playerId } },
      {
        onSuccess: async (pick) => {
          setRecentReveal(normalizeRevealPick(pick));
          playPickRevealSound(pick.round === 1);
          await refreshDraftQueries();
        },
      },
    );
  };

  const refreshDraftQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetDraftStateQueryKey(leagueId) }),
      queryClient.invalidateQueries({ queryKey: getGetDraftBoardQueryKey(leagueId) }),
      queryClient.invalidateQueries({ queryKey: getGetDraftActivityQueryKey(leagueId) }),
      queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey({ available: true, leagueId, search: searchTerm, position: posFilter || undefined }) }),
    ]);
  };

  const pauseDraft = async () => {
    await fetch(`/api/leagues/${leagueId}/draft/pause`, { method: "POST" });
    await refreshDraftQueries();
  };

  const undoPick = async () => {
    await fetch(`/api/leagues/${leagueId}/draft/undo`, { method: "POST" });
    await refreshDraftQueries();
  };

  const changeTimer = async () => {
    await fetch(`/api/leagues/${leagueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timerSeconds: timerDraftValue }),
    });
    setLocalClock(timerDraftValue);
    await refreshDraftQueries();
  };

  const assignPick = async () => {
    const playerId = Number(manualPlayerId || players?.[0]?.id);
    const teamId = Number(manualTeamId || draftState?.onTheClockTeamId);
    if (!playerId || !teamId) return;
    const response = await fetch(`/api/leagues/${leagueId}/draft/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, teamId }),
    });
    setManualPlayerId("");
    const pick = normalizeRevealPick(await response.json());
    setRecentReveal(pick);
    playPickRevealSound(pick.round === 1);
    await refreshDraftQueries();
  };

  return (
    <div className={`${tvMode ? "fixed inset-0 z-[100] h-screen" : "h-[calc(100dvh-4rem)]"} flex flex-col bg-background overflow-hidden relative`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.28),transparent_24rem),radial-gradient(circle_at_82%_0%,rgba(217,70,239,0.18),transparent_28rem),linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.42))]" />
      <div className="pointer-events-none absolute left-8 right-8 top-0 h-40 bg-[linear-gradient(105deg,transparent_5%,rgba(168,85,247,0.18)_18%,transparent_35%,rgba(217,70,239,0.14)_52%,transparent_70%)] blur-sm" />
      <AnimatePresence>
        {recentReveal && (
          <motion.div
            className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-md flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRecentReveal(null)}
          >
            <motion.div
              className={`relative w-full max-w-5xl overflow-hidden rounded-xl border ${recentReveal.round === 1 ? "border-accent shadow-[0_0_90px_hsl(var(--accent)/0.45)]" : "border-primary/50 shadow-[0_0_70px_hsl(var(--primary)/0.34)]"} bg-card`}
              initial={{ scale: 0.72, y: 80, rotateX: -12 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.85, y: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.38),transparent_28rem),radial-gradient(circle_at_85%_10%,hsl(var(--accent)/0.26),transparent_24rem),linear-gradient(145deg,rgba(9,5,18,0.95),rgba(26,7,47,0.9))]" />
              <div className="absolute inset-x-12 top-0 h-24 bg-[linear-gradient(90deg,transparent,rgba(216,180,254,0.25),transparent)] blur-xl" />
              {recentReveal.round === 1 && (
                <motion.div
                  className="absolute inset-x-0 top-0 h-2 bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.15, duration: 0.45 }}
                />
              )}
              <div className="relative grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 p-8">
                <motion.div
                  className="aspect-square rounded-xl border border-white/10 flex flex-col items-center justify-center text-center"
                  style={{ backgroundColor: recentReveal.team?.primaryColor ?? "hsl(var(--primary) / 0.25)" }}
                  initial={{ rotate: -8, scale: 0.78 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.08, type: "spring", stiffness: 220, damping: 12 }}
                >
                  <motion.div
                    className="font-heading text-7xl drop-shadow-[0_0_24px_rgba(216,180,254,0.8)]"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
                  >
                    {recentReveal.team?.logoUrl ?? initials(recentReveal.team?.name)}
                  </motion.div>
                  <div className="mt-4 text-sm uppercase tracking-widest opacity-80">{recentReveal.team?.name}</div>
                </motion.div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={recentReveal.round === 1 ? "bg-accent text-accent-foreground" : ""}>
                      ROUND {recentReveal.round} - PICK {recentReveal.pickInRound}
                    </Badge>
                    <Badge variant="outline">OVERALL #{recentReveal.overallPick}</Badge>
                    <Badge variant="outline" className={positionClass(recentReveal.player?.position)}>{recentReveal.player?.position}</Badge>
                  </div>
                  <motion.div
                    className="font-heading text-5xl md:text-7xl leading-none mb-4"
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.18 }}
                  >
                    {recentReveal.player?.name}
                  </motion.div>
                  <div className="mb-3 text-sm uppercase tracking-[0.3em] text-purple-200">AI Announcer: Pick is in</div>
                  <div className="mb-4 rounded-lg border border-purple-400/25 bg-purple-950/30 p-3 text-purple-100">
                    {postPickReaction(recentReveal)}
                  </div>
                  <div className="text-xl text-muted-foreground mb-5">
                    {recentReveal.player?.nflTeam} - ADP {recentReveal.player?.adp.toFixed(1)} - Bye {recentReveal.player?.byeWeek}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-background/70 border border-border p-3">
                      <div className="text-xs text-muted-foreground">Grade</div>
                      <div className="font-heading text-3xl text-primary">{recentReveal.grade}</div>
                    </div>
                    <div className="rounded-lg bg-background/70 border border-border p-3">
                      <div className="text-xs text-muted-foreground">Value</div>
                      <div className="font-heading text-3xl">{recentReveal.valueScore.toFixed(1)}</div>
                    </div>
                    <div className="rounded-lg bg-background/70 border border-border p-3">
                      <div className="text-xs text-muted-foreground">Sound</div>
                      <div className="font-heading text-xl flex items-center gap-2"><Megaphone className="h-5 w-5 text-accent" /> Cue</div>
                    </div>
                  </div>
                  {recentReveal.round === 1 && (
                    <motion.div
                      className="mt-5 rounded-lg border border-accent/40 bg-accent/10 p-4 font-heading text-2xl text-accent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 }}
                    >
                      FIRST ROUND FRANCHISE PICK
                    </motion.div>
                  )}
                  <Button className="mt-6 w-fit font-heading uppercase" onClick={() => setRecentReveal(null)}>Back to Board</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTunnel && onTheClockProfile && (
          <motion.div
            className="fixed inset-0 z-[180] flex items-center justify-center overflow-hidden bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 28%, ${onTheClockProfile.primaryColor ?? "#7c3aed"}55, transparent 28rem), linear-gradient(180deg, #05020c, #160326 55%, #030106)` }} />
            <motion.div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,.32),transparent_62%)] blur-2xl" animate={{ opacity: [0.35, 0.9, 0.45] }} transition={{ duration: 1.3, repeat: Infinity }} />
            <div className="absolute inset-0 opacity-45 bg-[linear-gradient(100deg,transparent_10%,rgba(216,180,254,.24)_18%,transparent_28%,rgba(168,85,247,.18)_42%,transparent_55%,rgba(236,72,153,.2)_70%,transparent_82%)]" />
            {Array.from({ length: 7 }).map((_, index) => (
              <motion.div
                key={index}
                className="absolute bottom-0 h-72 w-24 rounded-full bg-purple-500/20 blur-3xl"
                style={{ left: `${8 + index * 14}%` }}
                animate={{ y: [80, -30, 80], opacity: [0.08, 0.36, 0.08], scale: [0.8, 1.3, 0.9] }}
                transition={{ duration: 2.4 + index * 0.15, repeat: Infinity, delay: index * 0.12 }}
              />
            ))}
            <motion.div
              className="relative mx-6 w-full max-w-5xl rounded-2xl border border-purple-300/35 bg-card/40 p-8 text-center backdrop-blur-xl shadow-[0_0_120px_rgba(168,85,247,.42)]"
              initial={{ scale: 0.82, y: 70 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: -40 }}
              transition={{ type: "spring", stiffness: 140, damping: 17 }}
            >
              <motion.div
                className="mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-2xl border border-white/20 text-6xl font-heading text-white shadow-[0_0_60px_rgba(255,255,255,.18)]"
                style={{ backgroundColor: onTheClockProfile.primaryColor ?? "#7c3aed" }}
                initial={{ rotateY: -90 }}
                animate={{ rotateY: 0, scale: [1, 1.08, 1] }}
                transition={{ duration: 0.85, scale: { duration: 1.4, repeat: Infinity } }}
              >
                {onTheClockProfile.logoUrl ?? initials(onTheClockProfile.name)}
              </motion.div>
              <div className="text-sm font-heading uppercase tracking-[0.42em] text-purple-200">LeagueVerse Draft Tunnel</div>
              <motion.div
                className="mt-3 font-heading text-5xl md:text-8xl leading-none"
                initial={{ letterSpacing: "0.08em", opacity: 0 }}
                animate={{ letterSpacing: "0em", opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              >
                {onTheClockProfile.nickname ?? onTheClockProfile.ownerName}
              </motion.div>
              <div className="mt-3 text-2xl text-muted-foreground">{onTheClockProfile.name}</div>
              <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                <Badge className="justify-center py-2 bg-primary/25 text-primary border border-primary/30">NOW ON THE CLOCK</Badge>
                <Badge variant="outline" className="justify-center py-2"><Music2 className="mr-2 h-4 w-4" /> {onTheClockProfile.walkUpSong ?? "Walk-up cue"}</Badge>
                <Badge variant="outline" className="justify-center py-2"><Radio className="mr-2 h-4 w-4" /> {onTheClockProfile.soundEffectUrl ?? "mock://stadium-hit"}</Badge>
              </div>
              <div className="mt-5 flex flex-col items-center gap-2">
                <Button onClick={playWalkUpAudio} className="font-heading uppercase shadow-[0_0_30px_rgba(168,85,247,0.35)]">
                  <Volume2 className="mr-2 h-4 w-4" /> Play Walk-Up
                </Button>
                <div className="max-w-xl text-center text-xs text-purple-100/75">{audioStatus}</div>
              </div>
              <div className="mt-6 rounded-lg border border-purple-400/25 bg-background/55 p-4 text-lg text-purple-100">
                {announcerText}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-h-28 bg-card border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-4 md:px-6 py-4 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary)/0.22),transparent_40%,hsl(var(--accent)/0.16))]" />
        <div className="absolute inset-x-0 top-0 h-2" style={{ background: `linear-gradient(90deg, ${onTheClockProfile?.primaryColor ?? "hsl(var(--primary))"}, transparent)` }} />
        <div className="flex items-center gap-4 md:gap-5 z-10 min-w-0">
          <motion.div
            className="h-16 w-16 md:h-20 md:w-20 rounded-lg border border-primary/50 flex items-center justify-center font-heading text-2xl md:text-3xl shrink-0 shadow-[0_0_32px_hsl(var(--primary)/0.45)]"
            style={{ backgroundColor: onTheClockProfile?.primaryColor ?? "hsl(var(--muted))" }}
            animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1 }}
          >
            {onTheClockProfile?.logoUrl ?? initials(onTheClockProfile?.name)}
          </motion.div>
          <div className="min-w-0">
            <div className="text-xs text-purple-200 font-bold tracking-widest uppercase">AI Announcer Live - On The Clock</div>
            <div className="font-heading text-2xl md:text-4xl truncate">{onTheClockProfile?.name || "Waiting for draft"}</div>
            <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{onTheClockProfile?.ownerName}{onTheClockProfile?.nickname ? ` - ${onTheClockProfile.nickname}` : ""}</span>
              <span className="flex items-center gap-1"><Music2 className="h-4 w-4" /> {onTheClockProfile?.walkUpSong ?? "No song selected"}</span>
              <span>{onTheClockProfile?.mascot ?? "Mascot TBD"}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">{onTheClockProfile?.record ?? "0-0"}</Badge>
              <Badge variant="outline">{onTheClockProfile?.favoriteNflTeam ?? "Favorite team TBD"}</Badge>
              <Badge variant="outline">{onTheClockProfile?.slogan ?? "No slogan"}</Badge>
              <Badge variant="outline" className="border-primary/40 text-primary"><Flame className="mr-1 h-3 w-3" /> {onTheClockProfile?.draftPersonality ?? "Mystery drafter"}</Badge>
              <Badge variant="outline"><Swords className="mr-1 h-3 w-3" /> Rival: {onTheClockProfile?.rivalries ?? "TBD"}</Badge>
            </div>
          </div>
        </div>

        <div className="z-10 flex flex-wrap items-center gap-3 md:gap-5">
          <div className="text-center rounded-lg border border-primary/40 bg-background/80 px-6 py-3 min-w-[140px] shadow-[0_0_24px_hsl(var(--primary)/0.18)]">
            <div className="font-heading text-4xl text-primary tabular-nums flex items-center justify-center gap-2">
              <Clock className="h-7 w-7" /> {localClock}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">seconds</div>
          </div>
          <div className="text-right min-w-[190px]">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Pick</div>
            <div className="font-heading text-3xl text-accent">{draftState?.currentRound ?? 1}.{draftState?.currentPickInRound ?? 1}</div>
            <div className="text-sm text-muted-foreground">Overall {draftState?.currentOverallPick ?? 1}</div>
          </div>
          <Button variant="outline" onClick={playWalkUpAudio} className="font-heading uppercase">
            <Volume2 className="mr-2 h-4 w-4" /> Play Walk-Up
          </Button>
          <Button variant="outline" onClick={() => setShowTunnel(true)} className="font-heading uppercase">
            <Radio className="mr-2 h-4 w-4" /> Tunnel
          </Button>
          <Button onClick={toggleTvMode} className="font-heading uppercase">
            {tvMode ? <Expand className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />} TV Mode
          </Button>
          <div className="basis-full text-right text-xs text-purple-100/70">{audioStatus}</div>
        </div>
      </div>

      <div className={`${tvMode ? "grid grid-cols-[1fr_360px]" : "flex"} flex-1 overflow-hidden`}>
        {!tvMode && (
          <aside className="w-[300px] flex flex-col border-r border-border bg-card/40">
            <div className="p-4 border-b border-border">
              <h3 className="font-heading text-xl flex items-center gap-2"><Flame className="text-accent h-5 w-5" /> Position Scarcity</h3>
            </div>
            <ScrollArea className="h-64 p-4">
              <div className="space-y-4">
                {scarcity?.map((item) => (
                  <div key={item.position} className="space-y-1">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className={positionClass(item.position)}>{item.position}</span>
                      <span className={item.scarcityLevel === "high" || item.scarcityLevel === "critical" ? "text-accent" : "text-muted-foreground"}>{item.scarcityLevel.toUpperCase()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, (item.totalAvailable / 12) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-y border-border">
              <h3 className="font-heading text-xl flex items-center gap-2"><Zap className="text-primary h-5 w-5" /> Live Updates</h3>
              <p className="text-xs text-muted-foreground mt-1">Recommendations refresh every pick, round, and roster change.</p>
            </div>
            <div className="p-4 space-y-3">
              <Card className="bg-background/70 border-primary/20">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">Current Grade</div>
                  <div className="font-heading text-4xl text-primary">{warRoom.currentGrade}</div>
                  <div className="text-xs text-muted-foreground">Projected: {warRoom.projectedGrade}</div>
                </CardContent>
              </Card>
              <Card className="bg-background/70 border-accent/20">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">Championship Odds</div>
                  <div className="grid grid-cols-3 gap-2 text-center mt-2">
                    <div><div className="font-heading text-xl">{warRoom.beforeOdds.toFixed(1)}%</div><div className="text-[10px] text-muted-foreground">Before</div></div>
                    <div><div className="font-heading text-xl text-primary">{warRoom.afterOdds.toFixed(1)}%</div><div className="text-[10px] text-muted-foreground">After</div></div>
                    <div><div className="font-heading text-xl text-accent">+{warRoom.oddsDiff.toFixed(1)}%</div><div className="text-[10px] text-muted-foreground">Diff</div></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        )}

        <main className="min-w-0 flex-1 border-r border-border flex flex-col bg-background/60 relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
          <div className="absolute inset-x-0 top-0 h-32 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_55%)]" />
          <ScrollArea className="flex-1 p-5 relative z-10">
            <div className="min-w-max">
              <div className="flex gap-3 mb-3 sticky top-0 z-20 pb-2 bg-background/80 backdrop-blur">
                {draftBoard?.teams.map((team) => (
                  <div key={team.id} className="w-52 p-3 bg-card/90 border border-purple-500/25 rounded-lg shadow-[0_0_24px_rgba(168,85,247,0.12)]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded border border-white/10 flex items-center justify-center font-heading" style={{ backgroundColor: team.primaryColor ?? "hsl(var(--muted))" }}>
                        {team.logoUrl ?? initials(team.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading text-base truncate">{team.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{team.ownerName}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {Array.from({ length: draftBoard?.rounds || 5 }).map((_, roundIdx) => (
                <div key={roundIdx} className="flex gap-3 mb-3">
                  {draftBoard?.teams.map((team, teamIdx) => {
                    const pickNum = roundIdx % 2 === 0 ? teamIdx + 1 : draftBoard.teams.length - teamIdx;
                    const overall = roundIdx * draftBoard.teams.length + pickNum;
                    const pick = draftBoard.picks.find((item) => item.overallPick === overall);
                    const isCurrentPick = draftState?.currentOverallPick === overall;

                    return (
                      <motion.div
                        key={`${roundIdx}-${team.id}`}
                        initial={pick ? { opacity: 0, scale: 0.75, y: 14 } : false}
                        animate={{ scale: isCurrentPick ? 1.04 : 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 18 }}
                        className={`w-52 h-28 p-3 rounded-lg border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                          pick ? `${positionClass(pick.player?.position)} ${pick.round === 1 ? "shadow-[0_0_34px_hsl(var(--accent)/0.28)]" : ""}` : isCurrentPick ? "bg-primary/20 border-primary shadow-[0_0_44px_hsl(var(--primary)/0.55)]" : "bg-card/60 border-purple-500/15"
                        }`}
                      >
                        {pick?.round === 1 && <div className="absolute inset-x-0 top-0 h-1 bg-accent" />}
                        <div className="flex justify-between items-start text-[11px] font-mono opacity-70">
                          <span>R{roundIdx + 1} P{pickNum}</span>
                          <span>#{overall}</span>
                        </div>
                        {pick ? (
                          <div>
                            <div className="font-bold text-base leading-tight truncate">{pick.player?.name}</div>
                            <div className="text-xs font-mono opacity-80 mt-1">{pick.player?.position} - {pick.player?.nflTeam}</div>
                            <Badge variant="outline" className="mt-2 text-[10px]">Grade {pick.grade}</Badge>
                          </div>
                        ) : (
                          <div className={`font-heading text-3xl text-center ${isCurrentPick ? "text-primary animate-pulse" : "text-muted-foreground/30"}`}>
                            {isCurrentPick ? "ON CLOCK" : overall}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </main>

        <aside className={`${tvMode ? "w-full" : "w-[430px]"} flex flex-col bg-card/65 backdrop-blur border-l border-purple-500/20`}>
            <div className="p-4 border-b border-purple-500/20 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),rgba(0,0,0,0.25))]">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="h-14 w-14 rounded-xl border border-purple-400/40 bg-purple-950 flex items-center justify-center shadow-[0_0_28px_rgba(168,85,247,.32)]"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                >
                  <Bot className="h-8 w-8 text-purple-200" />
                </motion.div>
                <div>
                  <div className="font-heading text-2xl">AI War Room</div>
                  <div className="text-xs text-purple-200">Confidence {warRoom.confidence.toFixed(0)}% - Round {draftState?.currentRound ?? 1}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Card className="bg-background/75 border-primary/30">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-heading text-sm uppercase flex items-center gap-2 text-primary"><Trophy className="h-4 w-4" /> Best Pick</div>
                      <Badge variant="outline" className={positionClass(warRoom.best?.position)}>{warRoom.best?.position ?? "N/A"}</Badge>
                    </div>
                    <div className="font-bold text-lg">{warRoom.best?.name ?? "Loading board..."}</div>
                    <p className="text-xs text-muted-foreground mt-1">{warRoom.strategy}</p>
                    <div className="mt-3 text-sm">Value Score <span className="font-heading text-primary">{valueScore(warRoom.best).toFixed(0)}</span></div>
                    <Progress value={valueScore(warRoom.best)} className="mt-2" />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card className="bg-background/70 border-emerald-400/20">
                    <CardContent className="p-3">
                      <div className="font-heading text-sm uppercase flex items-center gap-2 text-emerald-300"><ShieldCheck className="h-4 w-4" /> Safe Pick</div>
                      <div className="font-bold mt-2 truncate">{warRoom.safe?.name ?? "Loading"}</div>
                      <div className="text-xs text-muted-foreground">Consistency {clamp(100 - playerRisk(warRoom.safe), 0, 100).toFixed(0)}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/70 border-sky-400/20">
                    <CardContent className="p-3">
                      <div className="font-heading text-sm uppercase flex items-center gap-2 text-sky-300"><Sparkles className="h-4 w-4" /> Sleeper Pick</div>
                      <div className="font-bold mt-2 truncate">{warRoom.sleeper?.name ?? "Loading"}</div>
                      <div className="text-xs text-muted-foreground">Hidden value: ADP {warRoom.sleeper?.adp.toFixed(1) ?? "-"}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-background/70 border-destructive/30">
                  <CardContent className="p-3">
                    <div className="font-heading text-sm uppercase flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Risk Warning</div>
                    <div className="font-bold mt-2">{warRoom.risk?.name ?? "No major risk"}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                      <div>Injury: {warRoom.risk?.injuryNote ?? "Clear"}</div>
                      <div>Age: Mock veteran curve</div>
                      <div>Role: {warRoom.risk?.position === "K" || warRoom.risk?.position === "DEF" ? "Volatile slot" : "Stable role"}</div>
                      <div>Bust: {playerRisk(warRoom.risk).toFixed(0)}%</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/70 border-purple-400/25">
                  <CardContent className="p-3">
                    <div className="font-heading text-sm uppercase flex items-center gap-2 text-purple-200"><Target className="h-4 w-4" /> Team Needs Analysis</div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {warRoom.needs.map((need) => (
                        <div key={need.pos} className="rounded border border-border bg-card/60 p-2">
                          <div className="flex justify-between text-xs mb-1"><span>{need.pos}</span><span>{need.strength}%</span></div>
                          <Progress value={need.strength} />
                          <div className="text-[10px] text-muted-foreground mt-1">Weakness {need.weakness}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/70 border-accent/25">
                  <CardContent className="p-3">
                    <div className="font-heading text-sm uppercase flex items-center gap-2 text-accent"><Brain className="h-4 w-4" /> Round Advice</div>
                    <p className="text-sm text-muted-foreground mt-2">{warRoom.roundAdvice}</p>
                    <div className="mt-3 rounded bg-purple-950/40 border border-purple-400/20 p-2 text-xs text-purple-100">
                      AI announcer: {announcerText}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="p-4 border-b border-border bg-card/70">
              <div className="relative overflow-hidden rounded-lg border border-border p-4" style={{ background: `linear-gradient(135deg, ${onTheClockProfile?.primaryColor ?? "hsl(var(--primary))"}, hsl(var(--background)))` }}>
                <div className="absolute inset-0 bg-background/45" />
                <div className="relative flex items-start gap-3">
                  <div className="h-14 w-14 rounded-full border border-white/20 bg-background flex items-center justify-center font-heading text-lg shrink-0">
                    {onTheClockProfile?.profilePhotoUrl ?? initials(onTheClockProfile?.ownerName)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-widest opacity-80">Owner Profile</div>
                    <div className="font-heading text-xl truncate">{onTheClockProfile?.ownerName ?? "Owner TBD"}</div>
                    <div className="text-sm opacity-85 truncate">{onTheClockProfile?.nickname ?? "No nickname"} - {onTheClockProfile?.mascot ?? "Mascot TBD"}</div>
                  </div>
                </div>
                <p className="relative mt-3 text-sm text-white/85 line-clamp-2">{onTheClockProfile?.bio ?? "No owner bio yet."}</p>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
                <div className="rounded bg-background/70 border border-primary/25 p-2"><span className="text-primary">Draft Personality:</span> {onTheClockProfile?.draftPersonality ?? "Mystery drafter"}</div>
                <div className="rounded bg-background/70 border border-border p-2"><span className="text-muted-foreground">Rivalries:</span> {onTheClockProfile?.rivalries ?? "TBD"}</div>
                <div className="rounded bg-background/70 border border-border p-2"><span className="text-muted-foreground">Championships:</span> {onTheClockProfile?.championshipHistory ?? "New franchise"}</div>
                <div className="rounded bg-background/70 border border-border p-2"><span className="text-muted-foreground">Team Banner:</span> {onTheClockProfile?.bannerUrl ?? "mock://banner"}</div>
                <div className="rounded bg-background/70 border border-border p-2">
                  <span className="text-muted-foreground">Audio:</span>{" "}
                  {isPlayableAudioUrl(onTheClockProfile?.walkUpSongUrl)
                    ? onTheClockProfile?.walkUpSongUrl
                    : onTheClockProfile?.walkUpSong
                      ? `Safe demo audio: ${onTheClockProfile.walkUpSong}`
                      : "No audio URL yet"}
                </div>
                <div className="rounded bg-background/70 border border-border p-2"><span className="text-muted-foreground">SFX:</span> {onTheClockProfile?.soundEffectUrl ?? "mock://sfx"}</div>
              </div>
            </div>
            <div className="p-4 border-b border-border bg-background/40">
              <h3 className="font-heading text-xl mb-3 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Commissioner Controls</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button variant="outline" onClick={pauseDraft} className="font-heading uppercase">
                  <Pause className="mr-2 h-4 w-4" /> {draftState?.status === "paused" ? "Resume" : "Pause"}
                </Button>
                <Button variant="outline" onClick={undoPick} className="font-heading uppercase">
                  <RotateCcw className="mr-2 h-4 w-4" /> Undo
                </Button>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 mb-3">
                <Input type="number" value={timerDraftValue} onChange={(event) => setTimerDraftValue(Number(event.target.value))} className="bg-background" />
                <Button onClick={changeTimer} variant="secondary" className="font-heading uppercase">Timer</Button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select value={manualTeamId} onChange={(event) => setManualTeamId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">On clock team</option>
                  {draftBoard?.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
                <select value={manualPlayerId} onChange={(event) => setManualPlayerId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Top queued player</option>
                  {players?.slice(0, 20).map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
                </select>
              </div>
              <Button onClick={assignPick} className="w-full font-heading uppercase">
                <UserPlus className="mr-2 h-4 w-4" /> Assign Pick Manually
              </Button>
            </div>
            <div className="p-4 border-b border-border">
              <h3 className="font-heading text-xl mb-3">Player Queue</h3>
              <div className="relative mb-3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search players..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-8 bg-background" />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {["ALL", "QB", "RB", "WR", "TE", "K", "DEF"].map((position) => (
                  <Badge key={position} variant={posFilter === (position === "ALL" ? "" : position) ? "default" : "outline"} className="cursor-pointer font-mono px-2 py-0.5 text-xs" onClick={() => setPosFilter(position === "ALL" ? "" : position)}>
                    {position}
                  </Badge>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                <AnimatePresence>
                  {players?.map((player) => (
                    <motion.div key={player.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`p-3 border rounded-lg ${positionClass(player.position)}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold">{player.name}</div>
                          <div className="text-xs font-mono mt-1 opacity-80">{player.position} - {player.nflTeam} - BYE {player.byeWeek}</div>
                          {player.injuryNote && (
                            <Badge variant="outline" className="mt-2 border-accent/50 text-accent">{player.status.toUpperCase()}: {player.injuryNote}</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-heading text-xl">#{player.rank}</div>
                          <div className="text-[10px] opacity-70">ADP {player.adp.toFixed(1)}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">{player.projectedPoints} projected pts</div>
                        <Button size="sm" onClick={() => handlePick(player.id)} disabled={makePick.isPending} className="font-heading uppercase">
                          Draft
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
            <div className="h-56 flex flex-col border-t border-border bg-card">
              <div className="p-3 border-b border-border flex justify-between items-center">
                <h3 className="font-heading text-lg flex items-center gap-2"><Activity className="h-4 w-4" /> Recent Picks Feed</h3>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {activity?.map((item) => {
                    const feedPick = draftBoard?.picks.find((pick) => pick.id === item.id);
                    return (
                      <motion.div
                        key={item.id}
                        className="text-sm flex gap-3 pb-3 border-b border-border/50 last:border-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="h-9 w-9 shrink-0 rounded border border-white/10 flex items-center justify-center font-heading text-xs" style={{ backgroundColor: feedPick?.team?.primaryColor ?? "hsl(var(--muted))" }}>
                          {feedPick?.team?.logoUrl ?? initials(item.teamName)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground font-mono">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div><strong className="text-primary">{item.teamName}</strong> drafted <strong>{item.playerName}</strong> <Badge variant="outline" className="ml-1 text-[10px]">{item.grade}</Badge></div>
                          <div className="mt-1 text-xs text-purple-200/80">{feedPick ? postPickReaction(normalizeRevealPick(feedPick)) : "AI booth logging the reaction."}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </aside>
      </div>
    </div>
  );
}
