import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, CalendarClock, Clapperboard, Crown, Medal, ScrollText, Shield, Star, Trophy } from "lucide-react";
import { ownerLegacyScore, useLeagueLegacy } from "@/lib/legacyData";

const tierStyles = {
  championship: "border-yellow-300/40 text-yellow-200",
  mvp: "border-sky-300/40 text-sky-200",
  draft: "border-primary/40 text-primary",
  commissioner: "border-emerald-300/40 text-emerald-200",
  rivalry: "border-red-300/40 text-red-200",
};

export default function History() {
  const { legacy } = useLeagueLegacy();
  const champions = legacy.history.filter((item) => item.type === "champion").sort((a, b) => b.year - a.year);
  const timeline = [...legacy.history].sort((a, b) => b.year - a.year);

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background">
      <section className="relative overflow-hidden border-b border-purple-500/20 px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(168,85,247,.34),transparent_28rem),radial-gradient(circle_at_82%_10%,rgba(14,165,233,.16),transparent_24rem)]" />
        <div className="container relative mx-auto">
          <Badge className="mb-4 bg-primary/20 text-primary border border-primary/30">LEAGUE ARCHIVE</Badge>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="font-heading text-5xl md:text-7xl leading-none">League History</h1>
              <p className="mt-4 max-w-3xl text-muted-foreground text-lg">
                Past champions, draft results, season records, league milestones, and the trophy room.
              </p>
            </div>
            <Card className="bg-card/80 border-purple-400/25">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Clapperboard className="h-10 w-10 text-primary" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">League Documentary</div>
                    <div className="font-heading text-3xl">6 Seasons Logged</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Every title, rivalry swing, draft legend, and comeback is saved to the LeagueVerse archive.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          {champions.map((event) => {
            const owner = legacy.owners.find((item) => item.id === event.teamId);
            return (
              <Card key={event.id} className="overflow-hidden bg-card/80 border-yellow-300/20">
                <div className="h-2" style={{ backgroundColor: owner?.color ?? "#a855f7" }} />
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <Crown className="h-8 w-8 text-yellow-200" />
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">{event.year} Champion</div>
                      <div className="font-heading text-2xl">{owner?.teamName}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{event.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="bg-card/80 border-purple-500/20">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center gap-3">
                <CalendarClock className="h-7 w-7 text-primary" />
                <div className="font-heading text-3xl">Timeline View</div>
              </div>
              <div className="space-y-4">
                {timeline.map((event) => {
                  const owner = legacy.owners.find((item) => item.id === event.teamId);
                  return (
                    <div key={event.id} className="grid gap-3 rounded-lg border border-border bg-background/55 p-4 md:grid-cols-[90px_1fr]">
                      <div>
                        <div className="font-heading text-3xl text-primary">{event.year}</div>
                        <Badge variant="outline" className="mt-1 capitalize">{event.type}</Badge>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-heading text-2xl">{event.title}</h2>
                          {owner && <Badge variant="outline" style={{ borderColor: owner.color }}>{owner.logo}</Badge>}
                        </div>
                        <p className="mt-2 text-muted-foreground">{event.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-card/80 border-white/10">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <ScrollText className="h-7 w-7 text-primary" />
                  <div className="font-heading text-3xl">Season Records</div>
                </div>
                <div className="space-y-3">
                  {[...legacy.owners].sort((a, b) => ownerLegacyScore(b) - ownerLegacyScore(a)).slice(0, 5).map((owner) => (
                    <div key={owner.id} className="flex items-center justify-between rounded-lg bg-background/65 p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded border border-white/10 flex items-center justify-center font-heading" style={{ backgroundColor: owner.color }}>{owner.logo}</div>
                        <div>
                          <div className="font-semibold">{owner.teamName}</div>
                          <div className="text-xs text-muted-foreground">{owner.mostWins} wins · {owner.mostPoints} points</div>
                        </div>
                      </div>
                      <Badge>{ownerLegacyScore(owner)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-purple-500/20">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Trophy className="h-7 w-7 text-primary" />
                  <div className="font-heading text-3xl">Trophy Room</div>
                </div>
                <div className="space-y-3">
                  {legacy.trophies.map((trophy) => {
                    const owner = legacy.owners.find((item) => item.id === trophy.teamId);
                    return (
                      <div key={trophy.id} className="rounded-lg border border-border bg-background/65 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {trophy.tier === "championship" ? <Trophy className="h-5 w-5 text-yellow-200" /> : trophy.tier === "mvp" ? <Star className="h-5 w-5 text-sky-200" /> : trophy.tier === "draft" ? <Medal className="h-5 w-5 text-primary" /> : trophy.tier === "commissioner" ? <Shield className="h-5 w-5 text-emerald-200" /> : <Award className="h-5 w-5 text-red-200" />}
                            <div>
                              <div className="font-heading text-lg">{trophy.award}</div>
                              <div className="text-xs text-muted-foreground">{owner?.teamName} · {trophy.year}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className={tierStyles[trophy.tier]}>{trophy.tier}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{trophy.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/hall-of-fame"><Button className="font-heading uppercase">Hall of Fame</Button></Link>
          <Link href="/rivalries"><Button variant="outline" className="font-heading uppercase">Rivalries</Button></Link>
        </div>
      </main>
    </div>
  );
}
