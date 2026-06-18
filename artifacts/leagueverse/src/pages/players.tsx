import { useMemo, useState } from "react";
import { useListPlayers, getListPlayersQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Activity, Search, ShieldAlert, Star, TrendingUp } from "lucide-react";

const positions = ["ALL", "QB", "RB", "WR", "TE", "K", "DEF"];

function positionClass(position: string) {
  return `bg-${position.toLowerCase()}`;
}

export default function Players() {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("ALL");
  const { data: players } = useListPlayers(undefined, {
    query: { queryKey: getListPlayersQueryKey() },
  });

  const filteredPlayers = useMemo(() => {
    return (players ?? []).filter((player) => {
      const matchesPosition = position === "ALL" || player.position === position;
      const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase()) || player.nflTeam.toLowerCase().includes(search.toLowerCase());
      return matchesPosition && matchesSearch;
    });
  }, [players, position, search]);

  const injuredCount = players?.filter((player) => player.status !== "active").length ?? 0;
  const topAdp = filteredPlayers[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/40 text-primary">SCOUTING DATABASE</Badge>
          <h1 className="text-4xl md:text-5xl font-heading mb-2">Player Database</h1>
          <p className="text-muted-foreground">Mock rankings with positions, NFL teams, bye weeks, ADP, projections, and injury tags.</p>
        </div>
        <div className="relative w-full lg:w-[360px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-11" placeholder="Search player or team..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card/70">
          <CardContent className="p-5 flex items-center gap-4">
            <Star className="h-8 w-8 text-primary" />
            <div><div className="text-sm text-muted-foreground">Top Ranked</div><div className="font-heading text-xl">{topAdp?.name ?? "Loading"}</div></div>
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardContent className="p-5 flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-accent" />
            <div><div className="text-sm text-muted-foreground">Players Loaded</div><div className="font-heading text-xl">{players?.length ?? 0}</div></div>
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardContent className="p-5 flex items-center gap-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <div><div className="text-sm text-muted-foreground">Injury Tags</div><div className="font-heading text-xl">{injuredCount}</div></div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
        {positions.map((pos) => (
          <Button key={pos} variant={position === pos ? "default" : "outline"} size="sm" onClick={() => setPosition(pos)} className="font-heading uppercase">
            {pos}
          </Button>
        ))}
      </div>

      <Card className="bg-card/70 overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="font-heading text-2xl flex items-center gap-2"><Activity className="text-primary" /> Rankings Board</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/70 text-muted-foreground">
                <tr className="text-left">
                  <th className="p-3 font-medium">Rank</th>
                  <th className="p-3 font-medium">Player</th>
                  <th className="p-3 font-medium">Pos</th>
                  <th className="p-3 font-medium">Team</th>
                  <th className="p-3 font-medium">Bye</th>
                  <th className="p-3 font-medium">ADP</th>
                  <th className="p-3 font-medium">Proj</th>
                  <th className="p-3 font-medium">Injury</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="border-t border-border/70 hover:bg-primary/5">
                    <td className="p-3 font-heading text-lg">#{player.rank}</td>
                    <td className="p-3 font-bold min-w-[220px]">{player.name}</td>
                    <td className="p-3"><Badge variant="outline" className={positionClass(player.position)}>{player.position}</Badge></td>
                    <td className="p-3 font-mono">{player.nflTeam}</td>
                    <td className="p-3">{player.byeWeek}</td>
                    <td className="p-3">{player.adp.toFixed(1)}</td>
                    <td className="p-3">{player.projectedPoints}</td>
                    <td className="p-3">
                      {player.injuryNote ? (
                        <Badge variant="outline" className="border-accent/50 text-accent">{player.status.toUpperCase()}: {player.injuryNote}</Badge>
                      ) : (
                        <Badge variant="outline" className="border-primary/30 text-primary">ACTIVE</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
