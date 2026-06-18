import { useEffect, useMemo, useState } from "react";

export type LegacyOwner = {
  id: number;
  teamName: string;
  ownerName: string;
  nickname: string;
  logo: string;
  color: string;
  championships: number;
  runnerUps: number;
  playoffAppearances: number;
  winPercentage: number;
  avgDraftGrade: number;
  seasons: number;
  mostWins: number;
  longestWinStreak: number;
  bestDraftGrade: string;
  mostPoints: number;
};

export type Rivalry = {
  id: number;
  teamAId: number;
  teamBId: number;
  trophy: string;
  headline: string;
  recordA: number;
  recordB: number;
  currentStreak: string;
  biggestGame: string;
  trashTalk: string;
};

export type HistoryEvent = {
  id: number;
  year: number;
  type: "champion" | "draft" | "record" | "milestone" | "comeback" | "upset";
  title: string;
  detail: string;
  teamId?: number;
};

export type Trophy = {
  id: number;
  teamId: number;
  award: string;
  year: number;
  tier: "championship" | "mvp" | "draft" | "commissioner" | "rivalry";
  detail: string;
};

export type LegacyState = {
  owners: LegacyOwner[];
  rivalries: Rivalry[];
  history: HistoryEvent[];
  trophies: Trophy[];
};

const storageKey = "leagueverse.legacy.v1";

const seedLegacy: LegacyState = {
  owners: [
    { id: 1, teamName: "Gridiron Galaxy", ownerName: "Jordan", nickname: "The Astronaut", logo: "GG", color: "#16a34a", championships: 2, runnerUps: 1, playoffAppearances: 5, winPercentage: 0.641, avgDraftGrade: 91, seasons: 6, mostWins: 12, longestWinStreak: 8, bestDraftGrade: "A+", mostPoints: 1842 },
    { id: 2, teamName: "End Zone Empire", ownerName: "Casey", nickname: "The Closer", logo: "EZ", color: "#f59e0b", championships: 1, runnerUps: 2, playoffAppearances: 5, winPercentage: 0.618, avgDraftGrade: 88, seasons: 6, mostWins: 11, longestWinStreak: 6, bestDraftGrade: "A", mostPoints: 1776 },
    { id: 3, teamName: "Waiver Wire Wizards", ownerName: "Morgan", nickname: "The Tactician", logo: "WW", color: "#0ea5e9", championships: 0, runnerUps: 1, playoffAppearances: 4, winPercentage: 0.553, avgDraftGrade: 84, seasons: 6, mostWins: 10, longestWinStreak: 5, bestDraftGrade: "A-", mostPoints: 1698 },
    { id: 4, teamName: "Blitz Brigade", ownerName: "Taylor", nickname: "The Hammer", logo: "BB", color: "#ef4444", championships: 1, runnerUps: 0, playoffAppearances: 3, winPercentage: 0.529, avgDraftGrade: 82, seasons: 6, mostWins: 9, longestWinStreak: 7, bestDraftGrade: "B+", mostPoints: 1650 },
    { id: 5, teamName: "Sunday Savants", ownerName: "Riley", nickname: "Professor Flex", logo: "SS", color: "#8b5cf6", championships: 1, runnerUps: 1, playoffAppearances: 6, winPercentage: 0.667, avgDraftGrade: 90, seasons: 6, mostWins: 13, longestWinStreak: 9, bestDraftGrade: "A", mostPoints: 1894 },
    { id: 6, teamName: "Fourth Down Force", ownerName: "Avery", nickname: "The Gambler", logo: "4D", color: "#14b8a6", championships: 0, runnerUps: 1, playoffAppearances: 2, winPercentage: 0.477, avgDraftGrade: 79, seasons: 6, mostWins: 8, longestWinStreak: 4, bestDraftGrade: "B", mostPoints: 1588 },
  ],
  rivalries: [
    { id: 1, teamAId: 1, teamBId: 2, trophy: "The Nebula Belt", headline: "Galaxy vs Empire", recordA: 7, recordB: 5, currentStreak: "Gridiron Galaxy W2", biggestGame: "2025 Championship Final", trashTalk: "Your dynasty still needs a launch window." },
    { id: 2, teamAId: 3, teamBId: 4, trophy: "The Wiretap Cup", headline: "Waiver Wire War", recordA: 6, recordB: 6, currentStreak: "Blitz Brigade W1", biggestGame: "2024 Semifinal Upset", trashTalk: "Check the waiver report before you talk." },
    { id: 3, teamAId: 5, teamBId: 6, trophy: "The Fourth Down Thesis", headline: "Brains vs Nerves", recordA: 8, recordB: 4, currentStreak: "Sunday Savants W3", biggestGame: "2023 Comeback Classic", trashTalk: "Probability is not a personality." },
  ],
  history: [
    { id: 1, year: 2021, type: "champion", title: "Blitz Brigade wins the first crown", detail: "Taylor rode a late-season RB heater to the inaugural LeagueVerse title.", teamId: 4 },
    { id: 2, year: 2022, type: "champion", title: "End Zone Empire closes the deal", detail: "Casey posted the league's best playoff point total and took the trophy.", teamId: 2 },
    { id: 3, year: 2023, type: "comeback", title: "Sunday Savants erase a 61-point deficit", detail: "The greatest comeback in league history started with a Monday night double stack.", teamId: 5 },
    { id: 4, year: 2024, type: "upset", title: "Waiver Wire Wizards stun the top seed", detail: "Morgan's emergency tight end outscored two first-round picks.", teamId: 3 },
    { id: 5, year: 2025, type: "champion", title: "Gridiron Galaxy launches a dynasty", detail: "Jordan wins a second title and enters Hall of Fame lock territory.", teamId: 1 },
    { id: 6, year: 2026, type: "draft", title: "LeagueVerse broadcast era begins", detail: "Draft tunnel intros, AI announcer reactions, and legacy scoring debut." },
  ],
  trophies: [
    { id: 1, teamId: 1, award: "League Champion", year: 2025, tier: "championship", detail: "Dominant playoff run with 1842 season points." },
    { id: 2, teamId: 1, award: "Draft King", year: 2025, tier: "draft", detail: "A+ draft grade and three top-20 value picks." },
    { id: 3, teamId: 5, award: "MVP Award", year: 2023, tier: "mvp", detail: "Highest single-season owner score." },
    { id: 4, teamId: 2, award: "Commissioner Award", year: 2022, tier: "commissioner", detail: "Cleanest roster build and best weekly notes." },
    { id: 5, teamId: 4, award: "League Champion", year: 2021, tier: "championship", detail: "First champion in league history." },
    { id: 6, teamId: 3, award: "Biggest Upset", year: 2024, tier: "rivalry", detail: "Knocked out the 12-win favorite." },
  ],
};

export function ownerLegacyScore(owner: LegacyOwner) {
  return Math.round(
    owner.championships * 140 +
      owner.runnerUps * 55 +
      owner.playoffAppearances * 22 +
      owner.winPercentage * 180 +
      owner.avgDraftGrade * 1.4 +
      owner.seasons * 9,
  );
}

export function getSeedLegacy() {
  return seedLegacy;
}

export function useLeagueLegacy() {
  const [legacy, setLegacy] = useState<LegacyState>(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return seedLegacy;
    try {
      return JSON.parse(stored) as LegacyState;
    } catch {
      return seedLegacy;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(legacy));
  }, [legacy]);

  return useMemo(() => ({ legacy, setLegacy }), [legacy]);
}
