import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot,
  Brain,
  Clapperboard,
  Crown,
  Film,
  History,
  Music2,
  PlayCircle,
  Radio,
  Scale,
  Sparkles,
  Swords,
  Trophy,
  Wand2,
} from "lucide-react";

const flow = [
  ["1", "Pre-Draft Show", "Lottery. Analysis. Strategy."],
  ["2", "Live Draft Experience", "Immersive. Intelligent. Interactive."],
  ["3", "Post-Draft Recap", "Stories. Grades. History."],
  ["4", "Season-Long Edge", "AI guidance. Win more."],
];

const teams = ["LV", "GG", "EZ", "WW", "BB", "SS", "4D", "AI"];
const counters = [["32", "Broadcast Moments"], ["98%", "Draft Edge Score"], ["12", "Franchise Stories"], ["24/7", "AI Commissioner"]];

const leagueVerseSections = [
  {
    stage: "Before the Draft",
    items: [
      { icon: Trophy, title: "Draft Lottery Show", copy: "Live reveal with lights, music, big moments, and owner drama." },
      { icon: Brain, title: "AI Scouting Report", copy: "Draft personality, targets, avoids, and custom league strategy." },
    ],
  },
  {
    stage: "During the Draft",
    items: [
      { icon: Music2, title: "Walk-Up Experience", copy: "Owner cards, team logos, song cues, and on-clock introductions." },
      { icon: Bot, title: "AI War Room", copy: "Best pick, safe pick, sleeper pick, risk warning, championship impact." },
      { icon: Radio, title: "Live Championship Simulator", copy: "Odds shift live as every pick changes the league balance." },
    ],
  },
  {
    stage: "After the Draft",
    items: [
      { icon: Clapperboard, title: "Draft Recap Show", copy: "Broadcast-style recap with biggest steals, reaches, and storylines." },
      { icon: Scale, title: "Draft Grades", copy: "Team-by-team grades with position balance and value context." },
      { icon: Film, title: "Draft Documentary", copy: "The draft becomes a season archive, not a forgotten room." },
      { icon: History, title: "Hall of Fame", copy: "Records, rings, rivalries, and draft history saved forever." },
    ],
  },
  {
    stage: "During the Season",
    items: [
      { icon: Crown, title: "Run My Franchise", copy: "Weekly franchise priorities and predictive action plans." },
      { icon: Wand2, title: "AI Trade Agent", copy: "Trade targets, offer scoring, and roster leverage." },
    ],
  },
];

const yahooSteps = ["Join League", "Random Order", "Draft Players", "That's It"];

export default function Landing() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] overflow-hidden bg-[linear-gradient(180deg,#040107,#0b0613_42%,#050208)]">
      <section className="relative min-h-[760px] border-b border-purple-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(168,85,247,0.38),transparent_32rem),radial-gradient(circle_at_80%_10%,rgba(217,70,239,0.22),transparent_36rem),radial-gradient(circle_at_50%_78%,rgba(88,28,135,0.34),transparent_26rem)]" />
        <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(105deg,transparent_5%,rgba(216,180,254,0.22)_18%,transparent_34%,rgba(147,51,234,0.24)_52%,transparent_72%)] blur-sm animate-pulse" />
        <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "radial-gradient(circle, rgba(216,180,254,.5) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
        <div className="absolute bottom-0 left-0 right-0 h-52 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.85))]" />

        <div className="container mx-auto px-4 py-10 relative">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-center min-h-[680px]">
            <div>
              <Badge variant="outline" className="mb-5 border-purple-400/60 text-purple-200 bg-purple-950/50">PREMIUM FANTASY FOOTBALL BROADCAST</Badge>
              <h1 className="text-5xl md:text-8xl font-heading leading-none mb-6 drop-shadow-[0_0_28px_rgba(168,85,247,.42)]">
                League<span className="text-purple-400">Verse</span><br />
                Draft <span className="text-zinc-400">vs</span> Yahoo Draft
              </h1>
              <p className="text-xl md:text-2xl text-purple-100/80 max-w-3xl mb-8">
                Not just a better draft. A whole new experience with lights, storylines, AI guidance, walk-up moments, and a season-long edge.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/leagues/1/draft"><Button size="lg" className="font-heading text-lg uppercase shadow-[0_0_32px_rgba(168,85,247,.35)]"><PlayCircle className="mr-2 h-5 w-5" /> Open Draft TV Mode</Button></Link>
                <Link href="/dashboard"><Button size="lg" variant="outline" className="font-heading text-lg uppercase"><Swords className="mr-2 h-5 w-5" /> Enter Platform</Button></Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                {counters.map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-purple-500/25 bg-black/45 p-4 glass-panel hover:scale-[1.03] transition-transform">
                    <div className="font-heading text-3xl text-purple-200 animate-pulse">{value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="relative rounded-2xl border border-purple-400/30 bg-black/50 p-6 shadow-[0_0_80px_rgba(147,51,234,.28)] glass-panel">
                <div className="aspect-square rounded-xl border border-purple-400/30 bg-[radial-gradient(circle_at_center,rgba(168,85,247,.36),transparent_52%),linear-gradient(145deg,#14071f,#050208)] flex flex-col items-center justify-center text-center overflow-hidden">
                  <Trophy className="h-36 w-36 text-purple-200 drop-shadow-[0_0_36px_rgba(216,180,254,.8)] animate-pulse" />
                  <div className="font-heading text-4xl mt-4">LeagueVerse Trophy</div>
                  <div className="text-purple-100/70 mt-2">Legacy starts on draft night</div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-background/70 p-3"><div className="text-xs text-muted-foreground">Draft Starts</div><div className="font-heading text-2xl text-purple-200">07</div><div className="text-[10px]">Days</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="text-xs text-muted-foreground">Countdown</div><div className="font-heading text-2xl text-purple-200">18</div><div className="text-[10px]">Hours</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="text-xs text-muted-foreground">Showtime</div><div className="font-heading text-2xl text-purple-200">42</div><div className="text-[10px]">Minutes</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-purple-500/25 bg-black/45 p-3 mb-8">
            <div className="flex gap-4 animate-[pulse_5s_ease-in-out_infinite]">
              {[...teams, ...teams].map((team, index) => (
                <div key={`${team}-${index}`} className="h-16 w-16 shrink-0 rounded-lg border border-purple-400/30 bg-purple-900/40 flex items-center justify-center font-heading text-xl text-purple-100 shadow-[0_0_24px_rgba(168,85,247,.24)]">
                  {team}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-3 md:px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-5">
          {flow.map(([number, title, copy]) => (
            <div key={number} className="rounded-lg border border-purple-500/30 bg-purple-950/55 p-4 flex items-center gap-3 shadow-[0_0_24px_rgba(147,51,234,0.14)] hover:-translate-y-1 transition-transform">
              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center font-heading text-lg">{number}</div>
              <div>
                <div className="font-heading text-sm md:text-base">{title}</div>
                <div className="text-xs text-purple-100/75">{copy}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {leagueVerseSections.map((section) => (
              <div key={section.stage} className="space-y-3">
                <h2 className="text-purple-300 font-heading text-lg text-center">{section.stage}</h2>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.title} className="bg-black/45 border-purple-500/25 shadow-[0_0_28px_rgba(147,51,234,0.10)] hover:shadow-[0_0_36px_rgba(168,85,247,0.25)] hover:-translate-y-1 transition-all glass-panel">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-heading flex items-center gap-2">
                          <Icon className="h-4 w-4 text-purple-300" /> {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="h-36 rounded-lg border border-purple-500/20 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.33),transparent_62%),linear-gradient(135deg,rgba(24,24,27,0.9),rgba(17,7,31,0.95))] flex items-center justify-center">
                          <Icon className="h-16 w-16 text-purple-200 drop-shadow-[0_0_18px_rgba(216,180,254,0.7)]" />
                        </div>
                        <p className="text-sm text-muted-foreground">{item.copy}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-center font-heading text-2xl text-zinc-300">Yahoo Draft Experience</h2>
            <Card className="bg-zinc-900/80 border-zinc-700">
              <CardContent className="p-4 grid grid-cols-4 gap-2">
                {yahooSteps.map((step, index) => (
                  <div key={step} className="text-center">
                    <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300">{index + 1}</div>
                    <div className="text-xs font-heading">{step}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/80 border-zinc-700">
              <CardHeader><CardTitle className="font-heading">Yahoo Draft Comparison Panel</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Basic interface", "No AI guidance", "No entertainment", "No stories", "No advantage"].map((bullet) => <li key={bullet}>- {bullet}</li>)}
                </ul>
                <div className="text-xl font-heading text-zinc-300">It's a tool.<br /><span className="text-purple-300">LeagueVerse is an experience.</span></div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="my-6 rounded-2xl border border-purple-500/30 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,.24),transparent_26rem),rgba(0,0,0,.58)] p-8 text-center shadow-[0_0_60px_rgba(147,51,234,.18)]">
          <div className="text-sm uppercase tracking-[0.35em] text-purple-200 mb-3">Featured Legacy Section</div>
          <div className="font-heading text-3xl md:text-5xl text-white">LeagueVerse isn't where you draft.</div>
          <div className="font-heading text-3xl md:text-5xl text-purple-300 mt-2">It's where you build your legacy.</div>
        </div>
      </section>
    </div>
  );
}
