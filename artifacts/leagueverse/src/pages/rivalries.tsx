import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, MessageSquareQuote, Shield, Swords, Trophy, Zap } from "lucide-react";
import { ownerLegacyScore, useLeagueLegacy } from "@/lib/legacyData";

export default function Rivalries() {
  const { legacy } = useLeagueLegacy();

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background">
      <section className="relative overflow-hidden border-b border-purple-500/20 px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,.3),transparent_26rem),radial-gradient(circle_at_76%_12%,rgba(239,68,68,.16),transparent_24rem)]" />
        <div className="container relative mx-auto">
          <Badge className="mb-4 bg-primary/20 text-primary border border-primary/30">RIVALRY WEEK CONTROL ROOM</Badge>
          <h1 className="font-heading text-5xl md:text-7xl leading-none">Rivalries</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground text-lg">
            Head-to-head history, rivalry trophies, streaks, grudge matches, and broadcast-ready trash talk.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {legacy.rivalries.map((rivalry) => {
          const teamA = legacy.owners.find((owner) => owner.id === rivalry.teamAId)!;
          const teamB = legacy.owners.find((owner) => owner.id === rivalry.teamBId)!;
          const total = rivalry.recordA + rivalry.recordB;
          const teamAPct = total ? (rivalry.recordA / total) * 100 : 50;
          const leader = rivalry.recordA >= rivalry.recordB ? teamA : teamB;

          return (
            <Card key={rivalry.id} className="overflow-hidden bg-card/80 border-purple-500/20">
              <div className="grid min-h-2 grid-cols-2">
                <div style={{ backgroundColor: teamA.color }} />
                <div style={{ backgroundColor: teamB.color }} />
              </div>
              <CardContent className="p-5 md:p-6">
                <div className="grid gap-5 lg:grid-cols-[1fr_280px_1fr] lg:items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-xl border border-white/10 flex items-center justify-center font-heading text-3xl text-white" style={{ backgroundColor: teamA.color }}>
                      {teamA.logo}
                    </div>
                    <div>
                      <div className="font-heading text-3xl">{teamA.teamName}</div>
                      <div className="text-muted-foreground">{teamA.ownerName} - {teamA.nickname}</div>
                      <Badge variant="outline" className="mt-2">{ownerLegacyScore(teamA)} legacy</Badge>
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-400/25 bg-background/65 p-5 text-center shadow-[0_0_50px_rgba(168,85,247,.14)]">
                    <Swords className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <div className="font-heading text-2xl">{rivalry.headline}</div>
                    <div className="mt-2 text-5xl font-heading">{rivalry.recordA}-{rivalry.recordB}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Head-to-head record</div>
                    <Progress value={teamAPct} className="mt-4" />
                    <Badge className="mt-4 bg-primary/20 text-primary border border-primary/30"><Trophy className="mr-1 h-3 w-3" /> {rivalry.trophy}</Badge>
                  </div>

                  <div className="flex items-center gap-4 lg:justify-end">
                    <div className="text-right">
                      <div className="font-heading text-3xl">{teamB.teamName}</div>
                      <div className="text-muted-foreground">{teamB.ownerName} - {teamB.nickname}</div>
                      <Badge variant="outline" className="mt-2">{ownerLegacyScore(teamB)} legacy</Badge>
                    </div>
                    <div className="h-20 w-20 rounded-xl border border-white/10 flex items-center justify-center font-heading text-3xl text-white" style={{ backgroundColor: teamB.color }}>
                      {teamB.logo}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-4">
                  <div className="rounded-lg bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-primary font-heading uppercase text-xs"><Flame className="h-4 w-4" /> Current Streak</div>
                    <div className="mt-2 text-xl font-heading">{rivalry.currentStreak}</div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-primary font-heading uppercase text-xs"><Zap className="h-4 w-4" /> Biggest Game</div>
                    <div className="mt-2 text-xl font-heading">{rivalry.biggestGame}</div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-primary font-heading uppercase text-xs"><Shield className="h-4 w-4" /> Series Leader</div>
                    <div className="mt-2 text-xl font-heading">{leader.teamName}</div>
                  </div>
                  <div className="rounded-lg bg-purple-950/35 border border-purple-400/20 p-4">
                    <div className="flex items-center gap-2 text-primary font-heading uppercase text-xs"><MessageSquareQuote className="h-4 w-4" /> Trash Talk</div>
                    <div className="mt-2 text-sm text-purple-100">"{rivalry.trashTalk}"</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/owners/${teamA.id}`}><Button variant="outline" className="font-heading uppercase">{teamA.teamName}</Button></Link>
                  <Link href={`/owners/${teamB.id}`}><Button variant="outline" className="font-heading uppercase">{teamB.teamName}</Button></Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
