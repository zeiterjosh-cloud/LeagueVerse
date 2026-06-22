import { useMemo, useState } from "react";
import {
  Activity,
  BadgeDollarSign,
  Bell,
  Brain,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Flame,
  Gauge,
  LineChart,
  Lock,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Sport = "All" | "NBA" | "NFL" | "MLB" | "NHL";
type OddsTab = "spread" | "moneyline" | "total";

const sports: Sport[] = ["All", "NBA", "NFL", "MLB", "NHL"];

const picks = [
  {
    id: "nyk-bos",
    sport: "NBA",
    game: "BOS Celtics at NY Knicks",
    market: "NYK +3.5",
    edge: "+6.8%",
    confidence: 87,
    time: "7:30 PM",
    signal: "Home pace advantage plus Boston on short rest.",
    sponsor: "Presented by NorthStar Sportsbook",
  },
  {
    id: "dal-phi",
    sport: "NFL",
    game: "DAL Cowboys at PHI Eagles",
    market: "PHI ML",
    edge: "+4.9%",
    confidence: 81,
    time: "8:20 PM",
    signal: "Linebacker mismatch and heavy public drift to Dallas.",
    sponsor: "Presented by JDZ Pro",
  },
  {
    id: "tor-nyy",
    sport: "MLB",
    game: "TOR Blue Jays at NY Yankees",
    market: "Under 8.5",
    edge: "+5.4%",
    confidence: 78,
    time: "6:05 PM",
    signal: "Wind suppression and two bullpens trending up.",
    sponsor: "Presented by BetNorth Partners",
  },
  {
    id: "edm-van",
    sport: "NHL",
    game: "EDM Oilers at VAN Canucks",
    market: "EDM -1.5",
    edge: "+3.7%",
    confidence: 73,
    time: "10:00 PM",
    signal: "Power-play edge widens after Vancouver lineup update.",
    sponsor: "Presented by RinkEdge",
  },
];

const oddsRows = [
  { book: "DraftKings", spread: "-110", moneyline: "+132", total: "O 221.5", status: "Best CPA" },
  { book: "FanDuel", spread: "-108", moneyline: "+128", total: "O 222.0", status: "Best Line" },
  { book: "BetMGM", spread: "-112", moneyline: "+130", total: "O 221.5", status: "Boost" },
  { book: "bet365", spread: "-109", moneyline: "+126", total: "O 220.5", status: "Live" },
];

const injuries = [
  { team: "BOS", player: "J. Brown", status: "Questionable", impact: "Spread moved 1.5 pts" },
  { team: "NYK", player: "M. Robinson", status: "Probable", impact: "Rebound model up 7%" },
  { team: "DAL", player: "C. Lamb", status: "Limited", impact: "Receiving yards lean down" },
  { team: "TOR", player: "G. Springer", status: "Day-to-day", impact: "Total unchanged" },
];

const news = [
  "Sharp volume entered NYK +3.5 across two books.",
  "Toronto bullpen availability confirmed after late scratch.",
  "Philadelphia weather model now favors first-half unders.",
  "Sponsored alert inventory is 68% sold for this week.",
];

const offers = [
  { name: "DraftKings", cpa: "$150 CPA", clicks: 1840, conversion: "11.6%", state: "Active" },
  { name: "FanDuel", cpa: "$175 CPA", clicks: 1325, conversion: "9.8%", state: "Active" },
  { name: "BetMGM", cpa: "$125 CPA", clicks: 980, conversion: "8.4%", state: "Review" },
];

const navItems = [
  { label: "Command", icon: Gauge },
  { label: "Picks", icon: Target },
  { label: "Odds", icon: LineChart },
  { label: "Injuries", icon: Stethoscope },
  { label: "News", icon: Newspaper },
  { label: "Pro", icon: Lock },
];

export default function JDZSportsAI() {
  const [sport, setSport] = useState<Sport>("All");
  const [selectedPick, setSelectedPick] = useState(picks[0]);
  const [oddsTab, setOddsTab] = useState<OddsTab>("spread");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [claimedOffer, setClaimedOffer] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredPicks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return picks.filter((pick) => {
      const sportMatch = sport === "All" || pick.sport === sport;
      const queryMatch =
        normalized.length === 0 ||
        pick.game.toLowerCase().includes(normalized) ||
        pick.market.toLowerCase().includes(normalized);
      return sportMatch && queryMatch;
    });
  }, [query, sport]);

  const visiblePicks = filteredPicks.length > 0 ? filteredPicks : picks;
  const activePick = visiblePicks.some((pick) => pick.id === selectedPick.id) ? selectedPick : visiblePicks[0];

  return (
    <div className="min-h-[calc(100dvh-4rem)] overflow-x-hidden bg-[#060809] text-white">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 xl:grid-cols-[236px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 bg-[#080b0c] px-4 py-6 xl:block">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10">
              <Brain className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase text-white">JDZ Sports AI</div>
              <div className="text-xs text-zinc-500">Command Center</div>
            </div>
          </div>
          <nav className="mt-6 space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition ${
                    index === 0
                      ? "bg-emerald-400/12 text-emerald-200"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="text-xs uppercase text-zinc-500">Today</div>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">AI Edge</span>
                <span className="font-semibold text-emerald-300">+5.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Live Games</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Offer Clicks</span>
                <span className="font-semibold text-amber-300">4,145</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex w-full max-w-full flex-col gap-4 overflow-hidden border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full min-w-0 max-w-[calc(100vw-2rem)] lg:max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200">19+ Regulated Markets</Badge>
                <Badge variant="outline" className="border-amber-400/30 text-amber-200">
                  AI model live
                </Badge>
              </div>
              <h1 className="mt-3 max-w-full text-3xl font-semibold uppercase tracking-normal text-white md:text-5xl">
                <span className="block">Sports Betting</span>
                <span className="block">Command Center</span>
              </h1>
              <p className="mt-2 max-w-full text-sm text-zinc-400 md:text-base">
                <span className="block">Daily AI picks, live odds movement,</span>
                <span className="block">injury intelligence, sponsor inventory,</span>
                <span className="block">and sportsbook affiliate offers in one operating view.</span>
              </p>
            </div>
            <div className="flex w-full max-w-[calc(100vw-2rem)] flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:max-w-none">
              <div className="relative min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search teams or markets"
                  className="h-10 border-white/10 bg-white/5 pl-9 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button className="bg-emerald-400 text-black hover:bg-emerald-300">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade Pro
              </Button>
            </div>
          </header>

          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "AI Win Confidence", value: `${activePick.confidence}%`, detail: activePick.market, icon: Trophy },
              { label: "Best Edge", value: activePick.edge, detail: activePick.game, icon: TrendingUp },
              { label: "Offer Revenue", value: "$30.8k", detail: "Projected monthly CPA", icon: CircleDollarSign },
              { label: "Alerts Sent", value: alertsEnabled ? "1,284" : "Paused", detail: "Push and email signals", icon: Bell },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-white/10 bg-white/[0.035]">
                  <CardContent className="flex items-start justify-between p-4">
                    <div className="min-w-0">
                      <div className="text-xs uppercase text-zinc-500">{stat.label}</div>
                      <div className="mt-1 text-2xl font-semibold text-white">{stat.value}</div>
                      <div className="mt-1 truncate text-xs text-zinc-400">{stat.detail}</div>
                    </div>
                    <Icon className="h-5 w-5 shrink-0 text-emerald-300" />
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {sports.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={sport === item ? "default" : "outline"}
                  className={
                    sport === item
                      ? "bg-emerald-400 text-black hover:bg-emerald-300"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                  }
                  onClick={() => setSport(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
              <Bell className="h-4 w-4 text-amber-300" />
              <span className="text-sm text-zinc-300">Smart alerts</span>
              <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.9fr)]">
            <div className="space-y-5">
              <Card className="border-emerald-400/20 bg-[#0b0f10]">
                <CardHeader className="flex flex-col items-start justify-between gap-4 pb-3 sm:flex-row">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-emerald-300">
                      <Flame className="h-4 w-4" />
                      AI Pick of the Day
                    </div>
                    <CardTitle className="mt-2 text-2xl font-semibold uppercase tracking-normal text-white">
                      {activePick.market}
                    </CardTitle>
                    <p className="mt-1 text-sm text-zinc-400">{activePick.game}</p>
                  </div>
                  <Badge className="bg-amber-300 text-black">{activePick.time}</Badge>
                </CardHeader>
                <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="border-r border-white/10 pr-4">
                        <div className="text-xs uppercase text-zinc-500">Confidence</div>
                        <div className="mt-1 text-4xl font-semibold text-white">{activePick.confidence}%</div>
                      </div>
                      <div className="border-r border-white/10 pr-4">
                        <div className="text-xs uppercase text-zinc-500">Model Edge</div>
                        <div className="mt-1 text-4xl font-semibold text-emerald-300">{activePick.edge}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-zinc-500">Signal</div>
                        <div className="mt-2 text-sm text-zinc-300">{activePick.signal}</div>
                      </div>
                    </div>
                    <Progress value={activePick.confidence} className="mt-5 h-2 bg-white/10" />
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button className="bg-emerald-400 text-black hover:bg-emerald-300">
                        <Target className="mr-2 h-4 w-4" />
                        Track Pick
                      </Button>
                      <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Set Game Alert
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                    <div className="text-xs uppercase text-zinc-500">Sponsor Placement</div>
                    <div className="mt-2 text-sm font-semibold text-white">{activePick.sponsor}</div>
                    <p className="mt-2 text-xs text-zinc-400">
                      One premium partner mention per featured pick keeps the app useful and sponsor value high.
                    </p>
                    <Button variant="outline" className="mt-4 w-full border-amber-300/30 text-amber-200 hover:bg-amber-300/10">
                      View Sponsor Slot
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <Card className="border-white/10 bg-[#0b0f10]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold uppercase tracking-normal text-white">
                      <Zap className="h-5 w-5 text-emerald-300" />
                      Pick Queue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {visiblePicks.map((pick) => (
                      <button
                        key={pick.id}
                        type="button"
                        onClick={() => setSelectedPick(pick)}
                        className={`w-full rounded-md border px-3 py-3 text-left transition ${
                          activePick.id === pick.id
                            ? "border-emerald-400/50 bg-emerald-400/10"
                            : "border-white/10 bg-white/[0.025] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-zinc-400">{pick.sport}</span>
                          <span className="text-xs text-emerald-300">{pick.edge}</span>
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white">{pick.market}</div>
                        <div className="mt-1 text-xs text-zinc-500">{pick.game}</div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-[#0b0f10]">
                  <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold uppercase tracking-normal text-white">
                      <LineChart className="h-5 w-5 text-emerald-300" />
                      Live Odds Board
                    </CardTitle>
                    <Tabs value={oddsTab} onValueChange={(value) => setOddsTab(value as OddsTab)}>
                      <TabsList className="bg-white/5">
                        <TabsTrigger value="spread">Spread</TabsTrigger>
                        <TabsTrigger value="moneyline">ML</TabsTrigger>
                        <TabsTrigger value="total">Total</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-md border border-white/10">
                      <div className="grid grid-cols-[1fr_90px_100px] border-b border-white/10 bg-white/[0.035] px-3 py-2 text-xs uppercase text-zinc-500">
                        <span>Sportsbook</span>
                        <span>Price</span>
                        <span>Status</span>
                      </div>
                      {oddsRows.map((row) => (
                        <div
                          key={row.book}
                          className="grid grid-cols-[1fr_90px_100px] items-center border-b border-white/10 px-3 py-3 text-sm last:border-b-0"
                        >
                          <span className="font-medium text-white">{row.book}</span>
                          <span className="text-emerald-300">{row[oddsTab]}</span>
                          <Badge variant="outline" className="w-fit border-white/10 text-zinc-300">
                            {row.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-5">
              <Card className="border-white/10 bg-[#0b0f10]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold uppercase tracking-normal text-white">
                    <Stethoscope className="h-5 w-5 text-red-300" />
                    Injury Report Center
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {injuries.map((item) => (
                    <div key={`${item.team}-${item.player}`} className="grid grid-cols-[52px_1fr] gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                      <div className="rounded-md bg-white/5 px-2 py-2 text-center text-xs font-semibold text-white">{item.team}</div>
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white">{item.player}</span>
                          <span className="text-xs text-amber-200">{item.status}</span>
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">{item.impact}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-[#0b0f10]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold uppercase tracking-normal text-white">
                    <Newspaper className="h-5 w-5 text-cyan-300" />
                    News Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {news.map((item) => (
                    <div key={item} className="flex gap-3 border-b border-white/10 pb-3 text-sm last:border-b-0 last:pb-0">
                      <Activity className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      <span className="text-zinc-300">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-amber-300/20 bg-[#0b0f10]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold uppercase tracking-normal text-white">
                    <BadgeDollarSign className="h-5 w-5 text-amber-300" />
                    Sportsbook Offers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {offers.map((offer) => (
                    <div key={offer.name} className="rounded-md border border-white/10 bg-white/[0.025] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-white">{offer.name}</div>
                          <div className="text-xs text-zinc-500">
                            {offer.cpa} | {offer.clicks.toLocaleString()} clicks | {offer.conversion}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={claimedOffer === offer.name ? "secondary" : "outline"}
                          className={
                            claimedOffer === offer.name
                              ? "bg-emerald-400 text-black hover:bg-emerald-300"
                              : "border-white/10 text-zinc-200 hover:bg-white/10"
                          }
                          onClick={() => setClaimedOffer(offer.name)}
                        >
                          {claimedOffer === offer.name ? "Tracked" : "View"}
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-md border border-white/10 bg-amber-300/10 p-3 text-xs text-amber-100">
                    Affiliate disclosure: JDZ may earn commission when users register through partner offers. 19+. Play responsibly.
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-400/20 bg-[#0b0f10]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                    <div>
                      <div className="text-sm font-semibold text-white">Ontario Compliance Ready</div>
                      <div className="text-xs text-zinc-500">Age gate, affiliate disclosure, responsible gambling copy, and region-aware offer controls.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
