import { Link } from "wouter";
import { Award, Crown, Flame, Medal, Shield, Sparkles, Star, Trophy, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ownerLegacyScore, useLeagueLegacy } from "@/lib/legacyData";

export default function HallOfFame() {
  const { legacy } = useLeagueLegacy();
  const ranked = [...legacy.owners].sort((a, b) => ownerLegacyScore(b) - ownerLegacyScore(a));
  const topScorer = [...legacy.owners].sort((a, b) => b.mostPoints - a.mostPoints)[0];
  const bestDraft = [...legacy.owners].sort((a, b) => b.avgDraftGrade - a.avgDraftGrade)[0];
  const mostWins = [...legacy.owners].sort((a, b) => b.mostWins - a.mostWins)[0];
  const longestStreak = [...legacy.owners].sort((a, b) => b.longestWinStreak - a.longestWinStreak)[0];
  const biggestUpset = legacy.history.find((item) => item.type === "upset");
  const greatestComeback = legacy.history.find((item) => item.type === "comeback");

  const records = [
    { icon: Trophy, label: "Champions", value: `${ranked[0]?.championships ?? 0} titles`, detail: ranked[0]?.teamName },
    { icon: Medal, label: "Runner-Up Finishes", value: `${ranked[1]?.runnerUps ?? 0}`, detail: ranked[1]?.teamName },
    { icon: Zap, label: "Most Points Scored", value: topScorer?.mostPoints.toLocaleString(), detail: topScorer?.teamName },
    { icon: Star, label: "Best Draft Grade", value: bestDraft?.bestDraftGrade, detail: bestDraft?.teamName },
    { icon: Shield, label: "Most Wins", value: `${mostWins?.mostWins ?? 0}`, detail: mostWins?.teamName },
    { icon: Flame, label: "Longest Win Streak", value: `${longestStreak?.longestWinStreak ?? 0} games`, detail: longestStreak?.teamName },
    { icon: Sparkles, label: "Biggest Upset", value: biggestUpset?.year, detail: biggestUpset?.title },
    { icon: TrendingUp, label: "Greatest Comeback", value: greatestComeback?.year, detail: greatestComeback?.title },
  ];

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background">
      <section className="relative overflow-hidden border-b border-purple-500/20 px-4 py-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(168,85,247,.34),transparent_28rem),radial-gradient(circle_at_82%_0%,rgba(217,70,239,.18),transparent_26rem)]" />
        <div className="container relative mx-auto">
          <Badge className="mb-4 bg-primary/20 text-primary border border-primary/30">LEAGUE LEGACY SYSTEM</Badge>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <h1 className="font-heading text-5xl md:text-7xl leading-none">Hall of Fame</h1>
              <p className="mt-4 max-w-3xl text-muted-foreground text-lg">
                Champions, record holders, dynasty builders, comeback artists, and draft-room legends.
              </p>
            </div>
            <Card className="bg-card/80 border-primary/30 shadow-[0_0_60px_rgba(168,85,247,.18)]">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Crown className="h-10 w-10 text-primary" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Current Legacy Leader</div>
                    <div className="font-heading text-3xl">{ranked[0]?.teamName}</div>
                  </div>
                </div>
                <div className="mt-4 text-5xl font-heading text-primary">{ownerLegacyScore(ranked[0])}</div>
                <div className="text-sm text-muted-foreground">Owner Legacy Score</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {records.map((record) => (
            <Card key={record.label} className="bg-card/75 border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 text-primary font-heading uppercase text-sm">
                  <record.icon className="h-5 w-5" /> {record.label}
                </div>
                <div className="mt-4 font-heading text-3xl">{record.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{record.detail}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {ranked.map((owner, index) => (
            <Card key={owner.id} className="overflow-hidden bg-card/80 border-purple-500/20">
              <div className="h-2" style={{ backgroundColor: owner.color }} />
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-lg border border-white/10 flex items-center justify-center font-heading text-2xl text-white" style={{ backgroundColor: owner.color }}>
                    {owner.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline">Rank #{index + 1}</Badge>
                      <Badge className="bg-primary/20 text-primary border border-primary/30">{ownerLegacyScore(owner)}</Badge>
                    </div>
                    <h2 className="mt-3 font-heading text-2xl truncate">{owner.teamName}</h2>
                    <p className="text-muted-foreground">{owner.ownerName} - {owner.nickname}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-2xl">{owner.championships}</div><div className="text-[11px] text-muted-foreground">Titles</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-2xl">{owner.runnerUps}</div><div className="text-[11px] text-muted-foreground">Finals</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-2xl">{owner.playoffAppearances}</div><div className="text-[11px] text-muted-foreground">Playoffs</div></div>
                </div>
                <div className="mt-5 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs"><span>Win Percentage</span><span>{Math.round(owner.winPercentage * 100)}%</span></div>
                    <Progress value={owner.winPercentage * 100} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs"><span>Draft Grade Index</span><span>{owner.avgDraftGrade}</span></div>
                    <Progress value={owner.avgDraftGrade} />
                  </div>
                </div>
                <Link href={`/owners/${owner.id}`}>
                  <Button className="mt-5 w-full font-heading uppercase"><Award className="mr-2 h-4 w-4" /> Franchise Page</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
