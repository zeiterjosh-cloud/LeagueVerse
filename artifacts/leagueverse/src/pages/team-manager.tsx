import { Link } from "wouter";
import { useListTeams, getListTeamsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music2 } from "lucide-react";

export default function TeamManager() {
  const { data: teams } = useListTeams(1, {
    query: { queryKey: getListTeamsQueryKey(1) },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading mb-6">Team Manager</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams?.map((team) => (
          <Card key={team.id} className="bg-card/70">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded border border-white/10 flex items-center justify-center font-heading text-xl" style={{ backgroundColor: team.primaryColor ?? "hsl(var(--muted))" }}>
                {team.logoUrl ?? team.draftPosition}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-heading text-xl truncate">{team.name}</div>
                <div className="text-sm text-muted-foreground truncate">{team.ownerName}</div>
                <div className="text-xs text-primary flex items-center gap-1 mt-1"><Music2 className="h-3 w-3" /> {team.walkUpSong ?? "No song"}</div>
              </div>
              <Link href={`/leagues/1/teams/${team.id}`}><Button variant="outline" size="sm">Open</Button></Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
