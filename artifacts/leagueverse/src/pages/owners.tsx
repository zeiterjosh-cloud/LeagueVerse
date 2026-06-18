import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useListTeams, getListTeamsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Flame, Music2, Palette, Shield, Swords, Trophy, Upload, UserRound, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { filterWalkUpSongs, getDefaultWalkUpSongUrl, getWalkUpSongLabel, isPlayableAudioUrl, playWalkUpPreview, walkUpSongCategories, type WalkUpSongCategoryFilter } from "@/lib/walkUpSongs";

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
  audioUrl?: string | null;
  soundEffectUrl?: string | null;
  soundEffect?: string | null;
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

export default function Owners() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: rawTeams } = useListTeams(1, { query: { queryKey: getListTeamsQueryKey(1) } });
  const teams = (rawTeams ?? []) as OwnerTeam[];
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<OwnerTeam>>({});
  const [songFilter, setSongFilter] = useState<WalkUpSongCategoryFilter>("All");
  const [songSearch, setSongSearch] = useState("");
  const filteredSongs = filterWalkUpSongs(songFilter, songSearch);

  const startEdit = (team: OwnerTeam) => {
    setEditingId(team.id);
    setDraft(team);
  };

  const save = async (team: OwnerTeam) => {
    const savedSong = draft.walkUpSong ?? team.walkUpSong ?? "Thunderstruck";
    const savedAudioUrl = draft.walkUpSongUrl ?? draft.audioUrl ?? team.walkUpSongUrl ?? team.audioUrl ?? getDefaultWalkUpSongUrl(savedSong);
    const savedSoundEffect = draft.soundEffectUrl ?? draft.soundEffect ?? team.soundEffectUrl ?? team.soundEffect ?? null;
    await fetch(`/api/leagues/${team.leagueId}/teams/${team.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        walkUpSong: savedSong,
        walkUpSongUrl: savedAudioUrl,
        audioUrl: savedAudioUrl,
        soundEffectUrl: savedSoundEffect,
        soundEffect: savedSoundEffect,
      }),
    });
    setEditingId(null);
    setDraft({});
    await queryClient.invalidateQueries({ queryKey: getListTeamsQueryKey(1) });
    toast({ title: "Owner profile saved", description: `${draft.ownerName ?? team.ownerName}'s franchise identity is updated.` });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/40 text-primary">FRANCHISE DIRECTORY</Badge>
          <h1 className="text-4xl md:text-5xl font-heading mb-2">Owner Profiles</h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage owner identity, team branding, walk-up audio URLs, slogans, logos, records, and draft position.
          </p>
        </div>
        <Link href="/leagues/1/draft">
          <Button className="font-heading uppercase"><Trophy className="mr-2 h-4 w-4" /> Open Draft Room</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
        {teams.map((team) => {
          const active = editingId === team.id;
          const current = active ? { ...team, ...draft } : team;
          return (
            <Card key={team.id} className="overflow-hidden bg-card/75 border-white/10">
              <div className="h-28 relative" style={{ background: `linear-gradient(135deg, ${current.primaryColor ?? "#16a34a"}, hsl(var(--background)))` }}>
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,hsl(var(--foreground)/0.08),transparent)]" />
                <div className="absolute left-5 bottom-[-34px] h-20 w-20 rounded-lg border-4 border-card flex items-center justify-center font-heading text-2xl text-white shadow-xl" style={{ backgroundColor: current.primaryColor ?? "#16a34a" }}>
                  {current.logoUrl ?? initials(current.name)}
                </div>
                <Badge className="absolute right-4 top-4 bg-background/70">Draft #{current.draftPosition}</Badge>
              </div>
              <CardHeader className="pt-12">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="font-heading text-2xl">{current.name}</CardTitle>
                    <p className="text-muted-foreground">{current.ownerName} {current.nickname ? `- ${current.nickname}` : ""}</p>
                  </div>
                  <Link href={`/owners/${team.id}`}>
                    <div className="h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center font-heading hover:border-primary transition-colors">
                      {current.profilePhotoUrl ?? initials(current.ownerName)}
                    </div>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-background/70 p-3"><div className="text-muted-foreground">Record</div><div className="font-heading text-xl">{current.record ?? "0-0"}</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="text-muted-foreground">Favorite</div><div className="font-heading text-xl">{current.favoriteNflTeam ?? "TBD"}</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="text-muted-foreground">Mascot</div><div className="font-heading text-xl">{current.mascot ?? "None"}</div></div>
                  <div className="rounded-lg bg-background/70 p-3"><div className="text-muted-foreground">Slogan</div><div className="font-heading text-base">{current.slogan ?? "No slogan"}</div></div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="rounded-lg bg-purple-950/35 border border-purple-400/20 p-3">
                    <div className="flex items-center gap-2 text-primary font-heading uppercase text-xs"><Flame className="h-3.5 w-3.5" /> Draft Personality</div>
                    <div className="mt-1 font-semibold">{current.draftPersonality ?? "Mystery drafter"}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="rounded-lg bg-background/70 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground"><Swords className="h-3.5 w-3.5" /> Rivalry</div>
                      <div className="font-heading">{current.rivalries ?? "TBD"}</div>
                    </div>
                    <div className="rounded-lg bg-background/70 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground"><Crown className="h-3.5 w-3.5" /> Banners</div>
                      <div className="font-heading">{current.championshipHistory ?? "New era"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/40"><Music2 className="mr-1 h-3 w-3" /> {current.walkUpSong ?? "No song"}</Badge>
                  <Badge variant="outline"><Upload className="mr-1 h-3 w-3" /> {isPlayableAudioUrl(current.walkUpSongUrl ?? current.audioUrl) ? "Real audio URL ready" : "Demo preview"}</Badge>
                  <Badge variant="outline"><Shield className="mr-1 h-3 w-3" /> {current.soundEffectUrl ?? current.soundEffect ?? "mock://effect"}</Badge>
                </div>

                <p className="text-sm text-muted-foreground min-h-10">{current.bio ?? "No owner bio yet."}</p>

                {active ? (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1"><Label>Owner</Label><Input value={draft.ownerName ?? ""} onChange={(event) => setDraft({ ...draft, ownerName: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Nickname</Label><Input value={draft.nickname ?? ""} onChange={(event) => setDraft({ ...draft, nickname: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Team Name</Label><Input value={draft.name ?? ""} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Franchise Logo</Label><Input value={draft.logoUrl ?? ""} onChange={(event) => setDraft({ ...draft, logoUrl: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Profile Photo</Label><Input value={draft.profilePhotoUrl ?? ""} onChange={(event) => setDraft({ ...draft, profilePhotoUrl: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Favorite NFL Team</Label><Input value={draft.favoriteNflTeam ?? ""} onChange={(event) => setDraft({ ...draft, favoriteNflTeam: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Primary Color</Label><Input value={draft.primaryColor ?? ""} onChange={(event) => setDraft({ ...draft, primaryColor: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Mascot</Label><Input value={draft.mascot ?? ""} onChange={(event) => setDraft({ ...draft, mascot: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Record</Label><Input value={draft.record ?? ""} onChange={(event) => setDraft({ ...draft, record: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Team Banner</Label><Input value={draft.bannerUrl ?? ""} onChange={(event) => setDraft({ ...draft, bannerUrl: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Draft Personality</Label><Input value={draft.draftPersonality ?? ""} onChange={(event) => setDraft({ ...draft, draftPersonality: event.target.value })} /></div>
                      <div className="space-y-1"><Label>Rivalries</Label><Input value={draft.rivalries ?? ""} onChange={(event) => setDraft({ ...draft, rivalries: event.target.value })} /></div>
                      <div className="space-y-1 sm:col-span-2"><Label>Championship History</Label><Input value={draft.championshipHistory ?? ""} onChange={(event) => setDraft({ ...draft, championshipHistory: event.target.value })} /></div>
                      <div className="space-y-1 sm:col-span-2"><Label>Slogan</Label><Input value={draft.slogan ?? ""} onChange={(event) => setDraft({ ...draft, slogan: event.target.value })} /></div>
                      <div className="space-y-1 sm:col-span-2"><Label>Bio</Label><Textarea value={draft.bio ?? ""} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label>Walk-up Song</Label>
                        <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
                          <Select value={songFilter} onValueChange={(value) => setSongFilter(value as WalkUpSongCategoryFilter)}>
                            <SelectTrigger><SelectValue placeholder="Filter by" /></SelectTrigger>
                            <SelectContent>{walkUpSongCategories.map((category) => <SelectItem key={category} value={category}>Filter by {category}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input placeholder="Search popular songs, artists, or vibe..." value={songSearch} onChange={(event) => setSongSearch(event.target.value)} />
                        </div>
                        <Select value={draft.walkUpSong ?? current.walkUpSong ?? "Thunderstruck"} onValueChange={(value) => setDraft({ ...draft, walkUpSong: value, walkUpSongUrl: getDefaultWalkUpSongUrl(value), audioUrl: getDefaultWalkUpSongUrl(value) })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {filteredSongs.map((song) => (
                              <SelectItem key={song.title} value={song.title}>{song.title} - {song.artist} · {song.vibe}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {filteredSongs.slice(0, 6).map((song) => (
                            <button
                              key={song.title}
                              type="button"
                              onClick={() => {
                                const audioUrl = song.previewUrl ?? draft.walkUpSongUrl ?? draft.audioUrl ?? current.walkUpSongUrl ?? current.audioUrl ?? getDefaultWalkUpSongUrl(song.title);
                                setDraft({ ...draft, walkUpSong: song.title, walkUpSongUrl: audioUrl, audioUrl });
                              }}
                              className={`rounded-lg border p-3 text-left transition hover:border-primary hover:bg-primary/10 ${current.walkUpSong === song.title ? "border-primary bg-primary/10" : "border-border bg-background/60"}`}
                            >
                              <div className="font-heading text-lg">{song.title}</div>
                              <div className="text-xs text-muted-foreground">{song.artist} · {song.category} · {song.vibe}</div>
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-muted-foreground">
                            Popular songs save the title for the broadcast. Paste a legal MP3/audio preview URL below to play the actual song clip.
                          </p>
                          <Button type="button" variant="outline" size="sm" onClick={() => void playWalkUpPreview(current.walkUpSong, current.walkUpSongUrl ?? current.audioUrl)} className="font-heading uppercase">
                            <Volume2 className="mr-2 h-4 w-4" /> Preview Demo
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1 sm:col-span-2"><Label>Actual Song Preview URL</Label><Input placeholder="https://.../preview.mp3" value={draft.walkUpSongUrl ?? draft.audioUrl ?? ""} onChange={(event) => setDraft({ ...draft, walkUpSongUrl: event.target.value, audioUrl: event.target.value })} /></div>
                      <div className="text-xs text-purple-200/75 sm:col-span-2">Selected: {getWalkUpSongLabel(current.walkUpSong)} · {isPlayableAudioUrl(current.walkUpSongUrl ?? current.audioUrl) ? "actual audio will play on click" : "safe demo preview will play until a URL is added"}</div>
                      <div className="space-y-1 sm:col-span-2"><Label>Custom Sound Effect URL</Label><Input value={draft.soundEffectUrl ?? draft.soundEffect ?? ""} onChange={(event) => setDraft({ ...draft, soundEffectUrl: event.target.value, soundEffect: event.target.value })} /></div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => save(team)} className="font-heading uppercase">Save Profile</Button>
                      <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" className="font-heading uppercase" onClick={() => startEdit(team)}>
                      <Palette className="mr-2 h-4 w-4" /> Edit Identity
                    </Button>
                    <Link href={`/owners/${team.id}`}>
                      <Button className="w-full font-heading uppercase">
                        <Trophy className="mr-2 h-4 w-4" /> View Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {teams.length === 0 && (
        <Card className="bg-card/70">
          <CardContent className="p-10 text-center text-muted-foreground">
            <UserRound className="h-10 w-10 mx-auto mb-3" />
            No owners found yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
