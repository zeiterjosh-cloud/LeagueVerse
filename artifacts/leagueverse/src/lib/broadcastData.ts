import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Award,
  Brain,
  CalendarClock,
  Clapperboard,
  Crown,
  Gauge,
  Lightbulb,
  Megaphone,
  Music2,
  Radio,
  Scale,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Wand2,
  Zap,
} from "lucide-react";

export type BroadcastModule = {
  slug: string;
  phase: "Pre-Draft" | "During Draft" | "Post-Draft" | "In-Season";
  title: string;
  eyebrow: string;
  summary: string;
  heroMetric: string;
  heroLabel: string;
  icon: typeof Trophy;
  panels: Array<{ title: string; value: string; detail: string; tone?: string }>;
  timeline: Array<{ step: string; title: string; detail: string }>;
  ticker: string[];
};

export type BroadcastState = {
  gmRating: number;
  lotterySeed: number;
  championshipProbability: number;
  weeklyFocus: string;
  modulesVisited: string[];
};

const storageKey = "leagueverse.broadcast.v1";

export const broadcastModules: BroadcastModule[] = [
  {
    slug: "draft-lottery",
    phase: "Pre-Draft",
    title: "Draft Lottery Show",
    eyebrow: "PRE-DRAFT SHOW",
    summary: "A TV-style lottery night with weighted odds, team logos, reveals, and commissioner drama.",
    heroMetric: "6",
    heroLabel: "Franchises in the reveal chamber",
    icon: Trophy,
    panels: [
      { title: "Lottery Odds", value: "24%", detail: "Fourth Down Force has the best odds for pick 1.01." },
      { title: "Reveal Order", value: "Snake", detail: "Weighted lottery feeds a balanced snake draft board." },
      { title: "Broadcast Cue", value: "Purple Smoke", detail: "Logo reveal, stage lights, and ticker reactions." },
      { title: "Commissioner Note", value: "Locked", detail: "Mock audit trail saved locally." },
    ],
    timeline: [
      { step: "1", title: "Pre-show opens", detail: "AI host previews team needs and GM personalities." },
      { step: "2", title: "Odds board locks", detail: "Every franchise receives a weighted lottery card." },
      { step: "3", title: "Pick order reveal", detail: "Cards flip one at a time with broadcast animations." },
      { step: "4", title: "Draft room syncs", detail: "The final order feeds the TV draft board." },
    ],
    ticker: ["Lottery chamber armed", "Commissioner feed live", "Gridiron Galaxy projected top-three"],
  },
  {
    slug: "scouting-report",
    phase: "Pre-Draft",
    title: "AI Scouting Report",
    eyebrow: "AI FILM ROOM",
    summary: "Player rankings, risk flags, team fit, bye-week pressure, and draft personality matching.",
    heroMetric: "1842",
    heroLabel: "Elite GM rating profile",
    icon: Brain,
    panels: [
      { title: "Top Target", value: "Ja'Marr Chase", detail: "Elite projection and immediate roster leverage." },
      { title: "Avoid Zone", value: "TE Risk", detail: "Veteran rest tags raise bust probability." },
      { title: "Personality Fit", value: "Value Hunter", detail: "Prioritizes ADP gaps and weekly floor." },
      { title: "Reliability", value: "96%", detail: "Mock confidence based on activity and history." },
    ],
    timeline: [
      { step: "1", title: "Board scan", detail: "AI reads rankings, ADP, injuries, and roster context." },
      { step: "2", title: "GM pattern match", detail: "Recommendations adapt to draft personality." },
      { step: "3", title: "Risk grade", detail: "Injury, role, age, and bye-week pressure are scored." },
      { step: "4", title: "War room packet", detail: "Targets are pushed into the live draft assistant." },
    ],
    ticker: ["AI scouting packet generated", "Best pick: Chase", "Risk watch: veteran TE tier"],
  },
  {
    slug: "gm-profile",
    phase: "Pre-Draft",
    title: "GM Profile & Personality",
    eyebrow: "GM IDENTITY SYSTEM",
    summary: "Create a football identity with rating tiers, draft tendencies, activity, and legacy growth.",
    heroMetric: "Gold",
    heroLabel: "Current GM rating tier",
    icon: Shield,
    panels: [
      { title: "Style", value: "Value Hunter", detail: "Trades down, attacks ADP discounts, avoids early panic." },
      { title: "Activity", value: "A", detail: "High waiver activity and lineup management." },
      { title: "Communication", value: "Balanced", detail: "Competitive without wrecking league vibes." },
      { title: "Legacy Path", value: "+2450", detail: "Hall of Fame tier unlocks with championships." },
    ],
    timeline: [
      { step: "1", title: "Create profile", detail: "Set fantasy style, preferences, and communication tone." },
      { step: "2", title: "We learn you", detail: "Drafting, trades, waivers, and reliability feed your GM profile." },
      { step: "3", title: "Rating grows", detail: "Skill, consistency, and titles move the tier meter." },
      { step: "4", title: "Legacy builds", detail: "Every season adds history to the owner profile." },
    ],
    ticker: ["GM profile active", "Tier: Gold", "Personality: Value Hunter"],
  },
  {
    slug: "matchmaking",
    phase: "Pre-Draft",
    title: "How Matchmaking Works",
    eyebrow: "FAIR. COMPETITIVE. FUN.",
    summary: "LeagueVerse balances leagues by GM rating, preferences, activity, and competitive style.",
    heroMetric: "8",
    heroLabel: "Stages to build your GM legacy",
    icon: Scale,
    panels: [
      { title: "Skill", value: "GM Rating", detail: "Win rate, strength of schedule, trading, and championships." },
      { title: "Activity", value: "Reliability", detail: "League completion and weekly engagement matter." },
      { title: "Preferences", value: "Format Fit", detail: "Redraft, dynasty, PPR, schedule, and time zone." },
      { title: "Balance", value: "Fair League", detail: "No lopsided rooms, better competition, more fun." },
    ],
    timeline: [
      { step: "1", title: "Join LeagueVerse", detail: "Tell us about your fantasy style." },
      { step: "2", title: "We calculate GM rating", detail: "Skill, results, activity, and reliability feed the score." },
      { step: "3", title: "We find your best match", detail: "Managers with similar ranges and preferences are grouped." },
      { step: "4", title: "Your league forms", detail: "Balanced competition turns into lasting rivalries." },
    ],
    ticker: ["Balanced leagues enabled", "GM range matched", "Competitive style normalized"],
  },
  {
    slug: "draft-order",
    phase: "Pre-Draft",
    title: "Draft Order Reveal",
    eyebrow: "THE PICKS ARE IN",
    summary: "A full-screen reveal board for pick slots, team logos, odds, and commissioner confirmation.",
    heroMetric: "1.01",
    heroLabel: "Current reveal spotlight",
    icon: Sparkles,
    panels: [
      { title: "Pick 1", value: "Gridiron Galaxy", detail: "Logo reveal with stage light sweep." },
      { title: "Pick 2", value: "End Zone Empire", detail: "Rivalry cutaway and AI commentary." },
      { title: "Pick 3", value: "Waiver Wizards", detail: "Draft strategy prediction appears." },
      { title: "Audit", value: "Saved", detail: "Order stored in local LeagueVerse state." },
    ],
    timeline: [
      { step: "1", title: "Stage lights", detail: "League logos pulse across the reveal wall." },
      { step: "2", title: "Card flip", detail: "Each team is revealed with odds and reaction." },
      { step: "3", title: "AI strategy", detail: "The booth predicts first-round plans." },
      { step: "4", title: "Board lock", detail: "Draft Board TV mode inherits the order." },
    ],
    ticker: ["Reveal card armed", "Pick 1.01 awaiting lock", "Snake board ready"],
  },
  {
    slug: "walk-up",
    phase: "During Draft",
    title: "Walk-Up Experience",
    eyebrow: "LIVE STAGE ENTRANCE",
    summary: "Owner intro tunnel with logo animation, nickname, walk-up song placeholder, smoke, and lights.",
    heroMetric: "0:53",
    heroLabel: "On-clock broadcast timer",
    icon: Music2,
    panels: [
      { title: "On The Clock", value: "The Astronaut", detail: "Team logo, smoke, and purple lights fire." },
      { title: "Song Cue", value: "Thunderstruck", detail: "Audio placeholder plays after user action." },
      { title: "Broadcast Graphic", value: "Live", detail: "Now on the clock lower-third is visible." },
      { title: "TV Mode", value: "Ready", detail: "Large-screen layout built for draft parties." },
    ],
    timeline: [
      { step: "1", title: "Team enters", detail: "The tunnel opens with color-matched lights." },
      { step: "2", title: "Nickname reveal", detail: "Owner identity becomes the broadcast focus." },
      { step: "3", title: "Song placeholder", detail: "Walk-up audio cue is triggered." },
      { step: "4", title: "Draft board returns", detail: "AI War Room takes over with best-pick guidance." },
    ],
    ticker: ["Walk-up tunnel ready", "AI announcer live", "TV mode compatible"],
  },
  {
    slug: "war-room",
    phase: "During Draft",
    title: "AI War Room",
    eyebrow: "DRAFT INTELLIGENCE",
    summary: "Best pick, safe pick, sleeper, risk warning, team needs, and championship impact in one panel.",
    heroMetric: "90%",
    heroLabel: "Recommendation confidence",
    icon: Target,
    panels: [
      { title: "Best Pick", value: "Ja'Marr Chase", detail: "Projection plus ADP leverage creates top board value." },
      { title: "Safe Pick", value: "Josh Allen", detail: "Elite consistency and weekly scoring floor." },
      { title: "Sleeper Pick", value: "Brandon Aubrey", detail: "Specialist value later than ADP." },
      { title: "Risk Warning", value: "Travis Kelce", detail: "Veteran rest tag raises bust probability." },
    ],
    timeline: [
      { step: "1", title: "Read the board", detail: "Available player pool and draft picks update live." },
      { step: "2", title: "Scan roster needs", detail: "QB, RB, WR, TE, FLEX, and bench are graded." },
      { step: "3", title: "Model championship swing", detail: "Before and after odds are compared." },
      { step: "4", title: "Broadcast the call", detail: "AI announcer explains the recommendation." },
    ],
    ticker: ["Best pick refreshed", "Risk model online", "Championship impact +8.0%"],
  },
  {
    slug: "championship-simulator",
    phase: "During Draft",
    title: "Live Championship Simulator",
    eyebrow: "TITLE ODDS ENGINE",
    summary: "Every pick updates projected title odds, roster balance, playoff path, and league leverage.",
    heroMetric: "+8.0%",
    heroLabel: "Projected swing after best pick",
    icon: Gauge,
    panels: [
      { title: "Before Pick", value: "16.0%", detail: "Baseline title probability entering the clock." },
      { title: "After Pick", value: "24.0%", detail: "Projected championship odds after best pick." },
      { title: "Roster Balance", value: "B+", detail: "Strong WR base, RB depth pending." },
      { title: "League Leverage", value: "High", detail: "Tier advantage if the room lets Chase fall." },
    ],
    timeline: [
      { step: "1", title: "Pre-pick odds", detail: "Model evaluates current roster and board." },
      { step: "2", title: "Simulate candidates", detail: "Top options are run through outcome ranges." },
      { step: "3", title: "Calculate swing", detail: "The biggest title delta becomes the recommendation." },
      { step: "4", title: "Track season path", detail: "Probability persists into in-season tools." },
    ],
    ticker: ["Title odds recalculated", "Roster build: WR anchor", "Playoff path upgraded"],
  },
  {
    slug: "draft-commentary",
    phase: "During Draft",
    title: "Draft Pick Commentary",
    eyebrow: "AI ANNOUNCER BOOTH",
    summary: "Pick reactions, reach warnings, rivalry jokes, grade reveals, and championship impact updates.",
    heroMetric: "A",
    heroLabel: "Projected post-pick grade",
    icon: Megaphone,
    panels: [
      { title: "Best Pick Comment", value: "Statement pick", detail: "Immediate leverage and clean roster fit." },
      { title: "Reach Warning", value: "TE Risk", detail: "Wait if veteran tight end tier is inflated." },
      { title: "Rivalry Joke", value: "Armed", detail: "Trash talk placeholders react to rivalry matchups." },
      { title: "Post-Pick Grade", value: "A-", detail: "Grade appears in reveal overlay and recent picks feed." },
    ],
    timeline: [
      { step: "1", title: "Pick submitted", detail: "Player and team metadata enter the booth." },
      { step: "2", title: "Context scan", detail: "AI checks value, rivalry, and title impact." },
      { step: "3", title: "Reaction generated", detail: "Commentary appears on board and feed." },
      { step: "4", title: "Recap saved", detail: "Draft documentary can reuse the moment." },
    ],
    ticker: ["Booth reaction ready", "Rivalry joke queued", "Post-pick grade model live"],
  },
  {
    slug: "live-odds",
    phase: "During Draft",
    title: "Live Odds Engine",
    eyebrow: "REAL-TIME PROBABILITY",
    summary: "Win totals, playoff odds, title probability, and weekly projection changes during the draft.",
    heroMetric: "62%",
    heroLabel: "Projected playoff probability",
    icon: BarChart3,
    panels: [
      { title: "Playoff Odds", value: "62%", detail: "Current build projects above league median." },
      { title: "Title Odds", value: "24%", detail: "Best pick creates a major championship swing." },
      { title: "Weekly Ceiling", value: "148.2", detail: "Starter projection after recommended pick." },
      { title: "Volatility", value: "Medium", detail: "Risk stays manageable with safe QB option." },
    ],
    timeline: [
      { step: "1", title: "Board state updates", detail: "Every pick shifts odds." },
      { step: "2", title: "Team needs rerate", detail: "Positions are scored against league scarcity." },
      { step: "3", title: "Odds publish", detail: "TV Mode shows the new probability." },
      { step: "4", title: "Tracker persists", detail: "In-season probability starts from draft output." },
    ],
    ticker: ["Live odds engine online", "Playoff probability: 62%", "Volatility: medium"],
  },
  {
    slug: "draft-grades",
    phase: "Post-Draft",
    title: "Draft Grades",
    eyebrow: "POST-DRAFT REPORT CARD",
    summary: "Overall grade, positional grades, best pick, biggest reach, and roster construction notes.",
    heroMetric: "A-",
    heroLabel: "Current projected draft grade",
    icon: Award,
    panels: [
      { title: "Best Pick", value: "Chase", detail: "Top board value with elite projection." },
      { title: "Biggest Reach", value: "Kicker tier", detail: "Specialist pick timing needs context." },
      { title: "Roster Build", value: "Balanced", detail: "Strong early WR and QB floor." },
      { title: "Grade Trend", value: "Rising", detail: "AI expects playoff-capable output." },
    ],
    timeline: [
      { step: "1", title: "Draft closes", detail: "All picks are compiled by team." },
      { step: "2", title: "Grades calculate", detail: "Value, risk, and fit are weighted." },
      { step: "3", title: "Show highlights", detail: "Best picks and reaches become broadcast segments." },
      { step: "4", title: "Archive saved", detail: "Grades feed Hall of Fame and legacy scoring." },
    ],
    ticker: ["Draft grade model ready", "Best pick: Chase", "Legacy archive updated"],
  },
  {
    slug: "draft-recap",
    phase: "Post-Draft",
    title: "Draft Recap Show",
    eyebrow: "LEAGUE STUDIOS",
    summary: "A sports-desk recap with best picks, reaches, team grades, and rivalry storylines.",
    heroMetric: "30",
    heroLabel: "Picks ready for the recap desk",
    icon: Radio,
    panels: [
      { title: "Best Desk Segment", value: "Galaxy opens hot", detail: "The first pick sets a title-contender tone." },
      { title: "Reach Segment", value: "TE debate", detail: "The booth debates veteran risk and ADP timing." },
      { title: "Rivalry Segment", value: "Galaxy vs Empire", detail: "Draft choices fuel the Nebula Belt rivalry." },
      { title: "Final Word", value: "Watchable", detail: "League moments become an actual show." },
    ],
    timeline: [
      { step: "1", title: "Roll highlights", detail: "Walk-up and pick reveal moments are replayed." },
      { step: "2", title: "Grade the room", detail: "Every team receives a broadcast grade." },
      { step: "3", title: "Build storylines", detail: "Rivalries and championship paths are framed." },
      { step: "4", title: "Publish recap", detail: "The recap enters league history." },
    ],
    ticker: ["Recap desk live", "Highlight package rendered", "Storylines generated"],
  },
  {
    slug: "draft-documentary",
    phase: "Post-Draft",
    title: "Draft Documentary",
    eyebrow: "LEAGUEVERSE FILMS",
    summary: "A mock documentary page that turns the draft into chapters, scenes, and owner narratives.",
    heroMetric: "5:24",
    heroLabel: "Mock episode runtime",
    icon: Clapperboard,
    panels: [
      { title: "Chapter 1", value: "The Lottery", detail: "How the draft order shaped the board." },
      { title: "Chapter 2", value: "The War Room", detail: "AI recommendations and tense clock moments." },
      { title: "Chapter 3", value: "The Reach", detail: "A controversial pick becomes the turning point." },
      { title: "Chapter 4", value: "The Legacy", detail: "Draft outcomes feed season-long history." },
    ],
    timeline: [
      { step: "1", title: "Collect moments", detail: "Reveals, grades, odds swings, and commentary are captured." },
      { step: "2", title: "Arrange chapters", detail: "The show becomes a draft-night story." },
      { step: "3", title: "Add narration", detail: "AI announcer copy becomes documentary voiceover." },
      { step: "4", title: "Save forever", detail: "The documentary appears in league history." },
    ],
    ticker: ["Documentary cut started", "Chapter timeline ready", "Hall of Fame archive linked"],
  },
  {
    slug: "run-franchise",
    phase: "In-Season",
    title: "Run My Franchise",
    eyebrow: "AI GM HQ",
    summary: "Season-long command center for lineup priorities, trade ideas, roster weakness, and title path.",
    heroMetric: "98%",
    heroLabel: "Top priority confidence",
    icon: Wand2,
    panels: [
      { title: "Top Priority", value: "Add RB depth", detail: "Bench stability is the fastest route to playoff equity." },
      { title: "Second Priority", value: "Trade WR depth", detail: "Package surplus to fix bye-week pressure." },
      { title: "Third Priority", value: "Hold QB", detail: "Consistency rating supports current starter." },
      { title: "Season Edge", value: "+11%", detail: "Projected title improvement if priorities are executed." },
    ],
    timeline: [
      { step: "1", title: "Analyze roster", detail: "Roster, standings, schedule, and injuries are scanned." },
      { step: "2", title: "Set priorities", detail: "Weekly tasks are ranked by championship impact." },
      { step: "3", title: "Recommend moves", detail: "Trades, waivers, and lineup changes are surfaced." },
      { step: "4", title: "Track progress", detail: "The probability tracker updates all season." },
    ],
    ticker: ["AI GM online", "Top priority: RB depth", "Title path upgraded"],
  },
  {
    slug: "trade-agent",
    phase: "In-Season",
    title: "AI Trade Agent",
    eyebrow: "NEGOTIATION DESK",
    summary: "Target players, offer packages, win-win ratings, rivalry context, and deal impact.",
    heroMetric: "78%",
    heroLabel: "Best offer acceptance score",
    icon: Users,
    panels: [
      { title: "Target", value: "Ja'Marr Chase", detail: "High-impact WR target with title swing potential." },
      { title: "Offer 1", value: "Breece + 2.05", detail: "Balanced value with strong acceptance odds." },
      { title: "Offer 2", value: "A.J. Brown + 3.07", detail: "Safer but lower ceiling." },
      { title: "Rivalry Tax", value: "+8%", detail: "Rival managers need extra value to accept." },
    ],
    timeline: [
      { step: "1", title: "Pick target", detail: "AI identifies the best roster fit." },
      { step: "2", title: "Build offers", detail: "Packages are ranked by fairness and impact." },
      { step: "3", title: "Read the room", detail: "Rivalry and GM personality affect acceptance." },
      { step: "4", title: "Track outcome", detail: "Accepted trades update title probability." },
    ],
    ticker: ["Trade agent scanning", "Best offer 78%", "Rivalry tax applied"],
  },
  {
    slug: "weekly-priorities",
    phase: "In-Season",
    title: "Weekly Priorities",
    eyebrow: "GAME WEEK BOARD",
    summary: "Weekly lineup, waiver, trade, injury, and matchup priorities ranked by urgency.",
    heroMetric: "3",
    heroLabel: "Critical tasks this week",
    icon: CalendarClock,
    panels: [
      { title: "Priority 1", value: "Waiver RB", detail: "Bye-week exposure requires immediate bench help." },
      { title: "Priority 2", value: "Flex decision", detail: "Projection gap is narrow; monitor injury tags." },
      { title: "Priority 3", value: "Trade check", detail: "Explore WR surplus before market closes." },
      { title: "Matchup Edge", value: "+7.4", detail: "Projected weekly advantage after moves." },
    ],
    timeline: [
      { step: "1", title: "Tuesday waivers", detail: "Claim priorities are set." },
      { step: "2", title: "Thursday injuries", detail: "Risk tags update lineup choices." },
      { step: "3", title: "Sunday lock", detail: "Final lineup edge is calculated." },
      { step: "4", title: "Monday recap", detail: "Outcome feeds GM rating and history." },
    ],
    ticker: ["Weekly board generated", "Waiver RB marked critical", "Matchup edge +7.4"],
  },
  {
    slug: "team-improvements",
    phase: "In-Season",
    title: "Team Improvement Recommendations",
    eyebrow: "ROSTER OPTIMIZER",
    summary: "Roster weakness ratings, positional fixes, bench upgrades, and long-term path recommendations.",
    heroMetric: "RB",
    heroLabel: "Primary weakness to improve",
    icon: Lightbulb,
    panels: [
      { title: "Weakness", value: "RB Depth", detail: "Injury and bye-week fragility reduce title odds." },
      { title: "Strength", value: "WR Ceiling", detail: "Top-end receiver output is championship caliber." },
      { title: "Bench Fix", value: "Handcuff", detail: "Add leverage back with high-upside reserve RB." },
      { title: "Long View", value: "Contender", detail: "One trade could move the team into elite tier." },
    ],
    timeline: [
      { step: "1", title: "Grade positions", detail: "Every roster slot receives strength and weakness scores." },
      { step: "2", title: "Find fixes", detail: "Waivers and trades are matched to gaps." },
      { step: "3", title: "Rank impact", detail: "Recommendations are sorted by title probability." },
      { step: "4", title: "Track improvements", detail: "Changes update the championship tracker." },
    ],
    ticker: ["Roster optimizer ready", "RB depth flagged", "WR strength elite"],
  },
  {
    slug: "championship-tracker",
    phase: "In-Season",
    title: "Championship Probability Tracker",
    eyebrow: "SEASON-LONG EDGE",
    summary: "Title odds trend line with weekly movement, roster changes, and league power rankings.",
    heroMetric: "24%",
    heroLabel: "Current championship probability",
    icon: Star,
    panels: [
      { title: "Before Draft", value: "12%", detail: "Baseline odds before LeagueVerse recommendations." },
      { title: "After Draft", value: "24%", detail: "Draft-night decisions doubled title equity." },
      { title: "Week 1 Target", value: "27%", detail: "Waiver RB and trade market can add edge." },
      { title: "Power Rank", value: "#2", detail: "Projection places team in top contender tier." },
    ],
    timeline: [
      { step: "1", title: "Draft baseline", detail: "Initial season odds start after the draft." },
      { step: "2", title: "Weekly updates", detail: "Lineups, injuries, trades, and wins shift probability." },
      { step: "3", title: "Playoff path", detail: "Remaining schedule and standings are simulated." },
      { step: "4", title: "Legacy result", detail: "Final season outcome feeds the Hall of Fame." },
    ],
    ticker: ["Probability tracker live", "Title odds 24%", "Power rank #2"],
  },
];

const seedBroadcast: BroadcastState = {
  gmRating: 1842,
  lotterySeed: 7,
  championshipProbability: 24,
  weeklyFocus: "Add RB depth",
  modulesVisited: [],
};

export function getBroadcastModule(slug: string) {
  return broadcastModules.find((module) => module.slug === slug) ?? broadcastModules[0];
}

export function useBroadcastState(slug?: string) {
  const [state, setState] = useState<BroadcastState>(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return seedBroadcast;
    try {
      return JSON.parse(stored) as BroadcastState;
    } catch {
      return seedBroadcast;
    }
  });

  useEffect(() => {
    if (!slug || state.modulesVisited.includes(slug)) return;
    setState((current) => ({ ...current, modulesVisited: [...current.modulesVisited, slug] }));
  }, [slug, state.modulesVisited]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  return useMemo(() => ({ state, setState }), [state]);
}
