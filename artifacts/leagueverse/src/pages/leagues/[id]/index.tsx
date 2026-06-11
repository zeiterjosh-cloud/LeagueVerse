import { useParams, Link } from "wouter";
import { 
  useGetLeague, getGetLeagueQueryKey,
  useGetLeagueSummary, getGetLeagueSummaryQueryKey,
  useListTeams, getListTeamsQueryKey,
  useStartDraft,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Activity, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LeagueOverview() {
  const { id } = useParams();
  const leagueId = Number(id);
  const { toast } = useToast();
  
  const { data: league, isLoading: leagueLoading } = useGetLeague(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetLeagueQueryKey(leagueId) }
  });
  
  const { data: teams, isLoading: teamsLoading } = useListTeams(leagueId, {
    query: { enabled: !!leagueId, queryKey: getListTeamsQueryKey(leagueId) }
  });

  const startDraft = useStartDraft();

  const handleStartDraft = () => {
    startDraft.mutate({ leagueId }, {
      onSuccess: () => {
        toast({ title: "Draft Started", description: "You are now on the clock." });
      }
    });
  };

  if (leagueLoading || teamsLoading) return <div className="p-8 text-center font-heading text-2xl animate-pulse">Loading League Data...</div>;
  if (!league) return <div className="p-8 text-center text-destructive">League not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Badge variant="outline" className="mb-2 uppercase text-primary border-primary">{league.status}</Badge>
          <h1 className="text-5xl font-heading">{league.name}</h1>
          <p className="text-muted-foreground text-lg flex items-center gap-2 mt-1">
            <Settings className="h-4 w-4" /> Commish: {league.commissionerName} • {league.numTeams} Teams • {league.scoringType.toUpperCase()}
          </p>
        </div>
        
        <div className="flex gap-4">
          {league.status !== 'completed' && (
             <Link href={`/leagues/${leagueId}/draft`}>
               <Button size="lg" className="font-heading text-2xl h-16 px-8 animate-pulse shadow-[0_0_15px_rgba(22,163,74,0.5)]">
                 <Play className="mr-2 h-6 w-6" /> ENTER DRAFT ROOM
               </Button>
             </Link>
          )}
          {league.status === 'predraft' && (
             <Button size="lg" variant="secondary" className="font-heading text-xl h-16" onClick={handleStartDraft} disabled={startDraft.isPending}>
               START DRAFT NOW
             </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <Users className="text-primary" /> Franchise War Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams?.map(team => (
                  <Link key={team.id} href={`/leagues/${leagueId}/teams/${team.id}`}>
                    <div className="p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-colors cursor-pointer group flex items-center gap-4">
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center font-heading text-2xl bg-primary/20 text-primary">
                        {team.draftPosition}
                      </div>
                      <div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">{team.ownerName}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-8">
          <Card className="glass-panel border-accent/20">
             <CardHeader>
               <CardTitle className="font-heading text-2xl flex items-center gap-2">
                 <Activity className="text-accent" /> Draft Hub
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <Link href={`/leagues/${leagueId}/grades`} className="block">
                 <Button variant="outline" className="w-full justify-start h-12 font-heading text-lg">
                    Draft Grades
                 </Button>
               </Link>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
