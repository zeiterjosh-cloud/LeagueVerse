import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getGetTeamQueryKey, getListTeamsQueryKey, useGetTeam, useListTeams } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Award, Crown, Flame, Medal, Music2, Radio, Shield, Swords, Trophy, UserRound, Volume2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { ownerLegacyScore, useLeagueLegacy } from "@/lib/legacyData";

type OwnerTeam = {
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
  walkUpSong?: string | null;
  walkUpSongUrl?: string | null;
  soundEffectUrl?: string | null;
  draftPersonality?: string | null;
  rivalries?: string | null;
  championshipHistory?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  draftPosition: number;
};

function initials(name?: string | null) {
  if (!name) return "LV";
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function OwnerProfile() {
  const params = useParams();
  const profileId = Number(params.id ?? 1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { legacy } = useLeagueLegacy();
  const { data: teamData } = useGetTeam(1, profileId, {
    query: { enabled: !!profileId, queryKey: getGetTeamQueryKey(1, profileId) },
  });
  const { data: teamsData } = useListTeams(1, { query: { queryKey: getListTeamsQueryKey(1) } });
  const team = (teamData && "id" in teamData ? teamData : (teamsData as OwnerTeam[] | undefined)?.find((item) => item.id === profileId)) as OwnerTeam | undefined;
  const [draft, setDraft] = useState<Partial<OwnerTeam>>({});
  const current = useMemo(() => ({ ...team, ...draft }) as OwnerTeam | undefined, [draft, team]);
  const legacyOwner = legacy.owners.find((owner) => owner.id === profileId);
  const ownerTrophies = legacy.trophies.filter((trophy) => trophy.teamId === profileId);
  const ownerHistory = legacy.history.filter((event) => event.teamId === profileId);
  const ownerRivalries = legacy.rivalries.filter((rivalry) => rivalry.teamAId === profileId || rivalry.teamBId === profileId);

  const save = async () => {
    if (!team) return;
    await fetch(`/api/leagues/${team.leagueId}/teams/${team.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setDraft({});
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetTeamQueryKey(team.leagueId, team.id) }),
      queryClient.invalidateQueries({ queryKey: getListTeamsQueryKey(team.leagueId) }),
    ]);
    toast({ title: "Profile saved", description: `${draft.ownerName ?? team.ownerName}'s broadcast identity is updated.` });
  };

  if (!current) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card className="bg-card/70">
          <CardContent className="p-10 text-center">
            <UserRound className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <div className="font-heading text-2xl">Owner profile not found</div>
            <Link href="/owners"><Button className="mt-4">Back to Owners</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background">
      <section className="relative overflow-hidden border-b border-purple-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(168,85,247,0.32),transparent_28rem),radial-gradient(circle_at_80%_10%,rgba(217,70,239,0.18),transparent_24rem)]" />
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${current.primaryColor ?? "hsl(var(--primary))"}, transparent)` }} />
        <div className="container relative mx-auto px-4 py-8 md:py-12">
          <Link href="/owners">
            <Button variant="outline" size="sm" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" /> Owners</Button>
          </Link>
          <div className="grid gap-6 lg:grid-cols-[260px_1fr_320px] lg:items-end">
            <div className="aspect-square rounded-xl border border-white/10 flex flex-col items-center justify-center text-white shadow-[0_0_70px_rgba(168,85,247,.28)]" style={{ backgroundColor: current.primaryColor ?? "#7c3aed" }}>
              <div className="font-heading text-7xl">{current.logoUrl ?? initials(current.name)}</div>
              <div className="mt-3 text-xs uppercase tracking-[0.28em] opacity-80">Franchise Logo</div>
            </div>
            <div>
              <Badge className="mb-3 bg-primary/20 text-primary border border-primary/30">DRAFT POSITION #{current.draftPosition}</Badge>
              <h1 className="font-heading text-5xl md:text-7xl leading-none">{current.name}</h1>
              <p className="mt-3 text-xl text-muted-foreground">{current.ownerName} - {current.nickname ?? "No nickname"}</p>
              <p className="mt-5 max-w-3xl text-muted-foreground">{current.bio ?? "No owner bio yet."}</p>
            </div>
            <Card className="bg-card/80 border-purple-400/25">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full border border-white/10 bg-background flex items-center justify-center font-heading text-2xl">
                    {current.profilePhotoUrl ?? initials(current.ownerName)}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Owner Avatar</div>
                    <div className="font-heading text-2xl">{current.nickname ?? current.ownerName}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-background/70 p-3"><div className="text-muted-foreground">Record</div><div className="font-heading text-xl">{current.record ?? "0-0"}</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="text-muted-foreground">NFL Team</div><div className="font-heading text-xl">{current.favoriteNflTeam ?? "TBD"}</div></div>
                </div>
                {legacyOwner && (
                  <div className="mt-4 rounded-lg bg-primary/10 border border-primary/25 p-3">
                    <div className="text-xs uppercase tracking-widest text-primary">Legacy Score</div>
                    <div className="font-heading text-4xl">{ownerLegacyScore(legacyOwner)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            { icon: Flame, label: "Draft Personality", value: current.draftPersonality ?? "Mystery drafter" },
            { icon: Swords, label: "Rivalries", value: current.rivalries ?? "No rivals yet" },
            { icon: Crown, label: "Championship History", value: current.championshipHistory ?? "New franchise" },
            { icon: Shield, label: "Mascot", value: current.mascot ?? "TBD" },
            { icon: Trophy, label: "Slogan", value: current.slogan ?? "No slogan" },
            { icon: Music2, label: "Walk-Up Song", value: current.walkUpSong ?? "No song selected" },
          ].map((item) => (
            <Card key={item.label} className="bg-card/75 border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 text-primary font-heading uppercase text-sm">
                  <item.icon className="h-5 w-5" /> {item.label}
                </div>
                <div className="mt-3 text-2xl font-heading">{item.value}</div>
              </CardContent>
            </Card>
          ))}

          <Card className="md:col-span-2 overflow-hidden bg-card/75 border-purple-500/20">
            <div className="relative h-44" style={{ background: `linear-gradient(135deg, ${current.primaryColor ?? "#7c3aed"}, #090510)` }}>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent)]" />
              <div className="absolute bottom-5 left-5">
                <div className="font-heading text-4xl">Walk-Up Tunnel Ready</div>
                <div className="text-purple-100"><Radio className="mr-2 inline h-4 w-4" /> {current.walkUpSongUrl ?? "mock://walk-up"} · <Volume2 className="mx-2 inline h-4 w-4" /> {current.soundEffectUrl ?? "mock://sfx"}</div>
              </div>
            </div>
          </Card>

          {legacyOwner && (
            <Card className="md:col-span-2 bg-card/80 border-purple-500/20">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Crown className="h-7 w-7 text-primary" />
                  <div className="font-heading text-3xl">Franchise Legacy Score</div>
                </div>
                <div className="grid gap-3 md:grid-cols-5">
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-3xl">{legacyOwner.championships}</div><div className="text-xs text-muted-foreground">Championships</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-3xl">{legacyOwner.playoffAppearances}</div><div className="text-xs text-muted-foreground">Playoffs</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-3xl">{Math.round(legacyOwner.winPercentage * 100)}%</div><div className="text-xs text-muted-foreground">Win Rate</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-3xl">{legacyOwner.bestDraftGrade}</div><div className="text-xs text-muted-foreground">Best Draft</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="font-heading text-3xl">{legacyOwner.seasons}</div><div className="text-xs text-muted-foreground">Seasons</div></div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div><div className="mb-1 flex justify-between text-xs"><span>Win Percentage</span><span>{Math.round(legacyOwner.winPercentage * 100)}%</span></div><Progress value={legacyOwner.winPercentage * 100} /></div>
                  <div><div className="mb-1 flex justify-between text-xs"><span>Draft Grade Index</span><span>{legacyOwner.avgDraftGrade}</span></div><Progress value={legacyOwner.avgDraftGrade} /></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="md:col-span-2 bg-card/80 border-white/10">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <Trophy className="h-7 w-7 text-primary" />
                <div className="font-heading text-3xl">Trophy Room</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {ownerTrophies.length ? ownerTrophies.map((trophy) => (
                  <div key={trophy.id} className="rounded-lg border border-border bg-background/65 p-4">
                    <div className="flex items-center gap-3">
                      {trophy.tier === "championship" ? <Trophy className="h-5 w-5 text-yellow-200" /> : trophy.tier === "draft" ? <Medal className="h-5 w-5 text-primary" /> : <Award className="h-5 w-5 text-purple-200" />}
                      <div>
                        <div className="font-heading text-xl">{trophy.award}</div>
                        <div className="text-xs text-muted-foreground">{trophy.year} · {trophy.tier}</div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{trophy.detail}</p>
                  </div>
                )) : <div className="text-muted-foreground">No trophies yet.</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-card/80 border-white/10">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <Swords className="h-7 w-7 text-primary" />
                <div className="font-heading text-3xl">Rivalry File</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {ownerRivalries.map((rivalry) => {
                  const opponentId = rivalry.teamAId === profileId ? rivalry.teamBId : rivalry.teamAId;
                  const opponent = legacy.owners.find((owner) => owner.id === opponentId);
                  return (
                    <div key={rivalry.id} className="rounded-lg border border-purple-400/20 bg-background/65 p-4">
                      <Badge className="mb-2 bg-primary/20 text-primary border border-primary/30">{rivalry.trophy}</Badge>
                      <div className="font-heading text-2xl">{rivalry.headline}</div>
                      <div className="text-sm text-muted-foreground">vs {opponent?.teamName} · {rivalry.recordA}-{rivalry.recordB}</div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-purple-100"><Zap className="h-4 w-4" /> {rivalry.currentStreak}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-card/80 border-white/10">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <Flame className="h-7 w-7 text-primary" />
                <div className="font-heading text-3xl">History</div>
              </div>
              <div className="space-y-3">
                {ownerHistory.length ? ownerHistory.map((event) => (
                  <div key={event.id} className="rounded-lg border border-border bg-background/65 p-4">
                    <div className="flex items-center gap-2"><Badge variant="outline">{event.year}</Badge><div className="font-heading text-xl">{event.title}</div></div>
                    <p className="mt-2 text-sm text-muted-foreground">{event.detail}</p>
                  </div>
                )) : <div className="text-muted-foreground">No franchise milestones logged yet.</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/80 border-purple-400/25">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Edit Broadcast Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Owner</Label><Input value={current.ownerName ?? ""} onChange={(event) => setDraft({ ...draft, ownerName: event.target.value })} /></div>
              <div className="space-y-1"><Label>Nickname</Label><Input value={current.nickname ?? ""} onChange={(event) => setDraft({ ...draft, nickname: event.target.value })} /></div>
              <div className="space-y-1"><Label>Team</Label><Input value={current.name ?? ""} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
              <div className="space-y-1"><Label>Logo</Label><Input value={current.logoUrl ?? ""} onChange={(event) => setDraft({ ...draft, logoUrl: event.target.value })} /></div>
              <div className="space-y-1"><Label>Avatar</Label><Input value={current.profilePhotoUrl ?? ""} onChange={(event) => setDraft({ ...draft, profilePhotoUrl: event.target.value })} /></div>
              <div className="space-y-1"><Label>Team Color</Label><Input value={current.primaryColor ?? ""} onChange={(event) => setDraft({ ...draft, primaryColor: event.target.value })} /></div>
              <div className="space-y-1"><Label>Favorite NFL Team</Label><Input value={current.favoriteNflTeam ?? ""} onChange={(event) => setDraft({ ...draft, favoriteNflTeam: event.target.value })} /></div>
              <div className="space-y-1"><Label>Draft Personality</Label><Input value={current.draftPersonality ?? ""} onChange={(event) => setDraft({ ...draft, draftPersonality: event.target.value })} /></div>
              <div className="space-y-1"><Label>Rivalries</Label><Input value={current.rivalries ?? ""} onChange={(event) => setDraft({ ...draft, rivalries: event.target.value })} /></div>
              <div className="space-y-1"><Label>Championship History</Label><Input value={current.championshipHistory ?? ""} onChange={(event) => setDraft({ ...draft, championshipHistory: event.target.value })} /></div>
              <div className="space-y-1"><Label>Walk-Up Song URL</Label><Input value={current.walkUpSongUrl ?? ""} onChange={(event) => setDraft({ ...draft, walkUpSongUrl: event.target.value })} /></div>
              <div className="space-y-1"><Label>Sound Effect URL</Label><Input value={current.soundEffectUrl ?? ""} onChange={(event) => setDraft({ ...draft, soundEffectUrl: event.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label>Bio</Label><Textarea value={current.bio ?? ""} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></div>
            <Button onClick={save} className="w-full font-heading uppercase">Save Owner Profile</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
