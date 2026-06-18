import { Link } from "wouter";
import { ArrowRight, BadgeCheck, CircleDot, Globe2, Radio, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { broadcastModules, getBroadcastModule, useBroadcastState } from "@/lib/broadcastData";

const phaseOrder = ["Pre-Draft", "During Draft", "Post-Draft", "In-Season"] as const;

export default function BroadcastPage({ slug }: { slug: string }) {
  const module = getBroadcastModule(slug);
  const { state } = useBroadcastState(slug);
  const phaseModules = broadcastModules.filter((item) => item.phase === module.phase);
  const Icon = module.icon;

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-purple-500/25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,.34),transparent_28rem),radial-gradient(circle_at_82%_8%,rgba(14,165,233,.16),transparent_26rem),linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.32))]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,#a855f7,#22d3ee,transparent)]" />
        <div className="container relative mx-auto px-4 py-8 md:py-10">
          <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge className="bg-primary/20 text-primary border border-primary/30">{module.eyebrow}</Badge>
                <Badge variant="outline">{module.phase}</Badge>
                <Badge variant="outline">TV MODE READY</Badge>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl leading-none">{module.title}</h1>
              <p className="mt-4 max-w-4xl text-lg text-muted-foreground">{module.summary}</p>
            </div>
            <Card className="min-w-[300px] bg-card/80 border-primary/30 shadow-[0_0_70px_rgba(168,85,247,.22)]">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/40 bg-primary/15">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Broadcast Signal</div>
                    <div className="font-heading text-4xl text-primary">{module.heroMetric}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">{module.heroLabel}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            {phaseOrder.map((phase, index) => (
              <Link key={phase} href={`/${broadcastModules.find((item) => item.phase === phase)?.slug ?? "matchmaking"}`}>
                <div className={`h-full rounded-lg border p-3 transition hover:border-primary/60 ${phase === module.phase ? "border-primary/50 bg-primary/15" : "border-border bg-card/50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-heading">{index + 1}</div>
                    <div>
                      <div className="font-heading text-lg">{phase}</div>
                      <div className="text-xs text-muted-foreground">{broadcastModules.filter((item) => item.phase === phase).length} modules</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-7 space-y-7">
        <div className="grid gap-4 xl:grid-cols-4">
          {module.timeline.map((item, index) => (
            <Card key={item.step} className="relative overflow-hidden bg-card/75 border-white/10">
              <div className="absolute right-[-18px] top-[-18px] h-20 w-20 rounded-full bg-primary/15 blur-xl" />
              <CardContent className="relative p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-heading text-xl">{item.step}</div>
                  {index < module.timeline.length - 1 && <ArrowRight className="hidden h-5 w-5 text-primary/70 xl:block" />}
                </div>
                <div className="font-heading text-2xl">{item.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-4 md:grid-cols-2">
            {module.panels.map((panel) => (
              <Card key={panel.title} className="bg-card/80 border-purple-500/20">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-primary font-heading uppercase text-sm">
                    <CircleDot className="h-4 w-4" /> {panel.title}
                  </div>
                  <div className="font-heading text-4xl">{panel.value}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{panel.detail}</p>
                  <Progress className="mt-4" value={Math.min(96, Math.max(34, panel.value.length * 8))} />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-5">
            <Card className="bg-card/80 border-primary/30">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Radio className="h-7 w-7 text-primary" />
                  <div className="font-heading text-2xl">Live Control Ticker</div>
                </div>
                <div className="space-y-3">
                  {module.ticker.map((item) => (
                    <div key={item} className="rounded-lg border border-border bg-background/65 p-3 text-sm">
                      <BadgeCheck className="mr-2 inline h-4 w-4 text-emerald-300" /> {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-white/10">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Sparkles className="h-7 w-7 text-primary" />
                  <div className="font-heading text-2xl">Persistent Mock State</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-3xl">{state.gmRating}</div><div className="text-xs text-muted-foreground">GM Rating</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-3xl">{state.championshipProbability}%</div><div className="text-xs text-muted-foreground">Title Odds</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-3xl">{state.modulesVisited.length}</div><div className="text-xs text-muted-foreground">Visited</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-3xl">{state.lotterySeed}</div><div className="text-xs text-muted-foreground">Lottery Seed</div></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="overflow-hidden bg-card/80 border-purple-500/20">
          <CardContent className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Globe2 className="h-7 w-7 text-primary" />
                <div>
                  <div className="font-heading text-2xl">LeagueVerse Universe</div>
                  <div className="text-sm text-muted-foreground">One universe. Every phase. Every season.</div>
                </div>
              </div>
              <Link href="/leagues/1/draft?tv=1">
                <Button className="font-heading uppercase"><Trophy className="mr-2 h-4 w-4" /> Open TV Draft Board</Button>
              </Link>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
              {phaseModules.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link key={item.slug} href={`/${item.slug}`}>
                    <div className={`h-full rounded-lg border p-3 transition hover:border-primary/60 ${item.slug === module.slug ? "border-primary/50 bg-primary/15" : "border-border bg-background/50"}`}>
                      <ItemIcon className="mb-3 h-5 w-5 text-primary" />
                      <div className="font-heading text-sm uppercase">{item.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{item.heroLabel}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
