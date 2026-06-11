import { useParams } from "wouter";
import { useGetTeam, getGetTeamQueryKey, useGetTeamRoster, getGetTeamRosterQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeamRoster() {
  const { id, teamId } = useParams();
  const lId = Number(id);
  const tId = Number(teamId);

  const { data: team } = useGetTeam(lId, tId, { query: { enabled: !!lId && !!tId, queryKey: getGetTeamQueryKey(lId, tId) } });
  const { data: roster } = useGetTeamRoster(lId, tId, { query: { enabled: !!lId && !!tId, queryKey: getGetTeamRosterQueryKey(lId, tId) } });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 border-b border-border pb-8">
        <h1 className="text-5xl font-heading">{team?.name}</h1>
        <p className="text-xl text-muted-foreground uppercase tracking-widest">{team?.ownerName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Current Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roster?.map(pick => (
                <div key={pick.id} className="p-3 bg-card border border-border rounded flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <Badge variant="outline" className={`bg-${pick.player?.position.toLowerCase()} font-mono`}>{pick.player?.position}</Badge>
                     <span className="font-bold">{pick.player?.name}</span>
                   </div>
                   <div className="text-sm font-mono text-muted-foreground">Pick {pick.overallPick}</div>
                </div>
              ))}
              {(!roster || roster.length === 0) && (
                <div className="p-8 text-center text-muted-foreground border border-dashed rounded">No players drafted yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
