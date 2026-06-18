import { useState } from "react";
import { useListLeagues, getListLeaguesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, Users, Clock, Settings, RefreshCw, LayoutDashboard, Swords } from "lucide-react";
import { SyncLeagueModal } from "@/components/SyncLeagueModal";

export default function Home() {
  const [syncOpen, setSyncOpen] = useState(false);
  const { data: leagues, isLoading } = useListLeagues({ query: { queryKey: getListLeaguesQueryKey() } });
  const leagueList = Array.isArray(leagues) ? leagues : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading mb-2">Command Center</h1>
          <p className="text-muted-foreground">Manage your fantasy football leagues and dominate draft day.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            variant="outline"
            className="font-heading text-base h-12 uppercase tracking-wide"
            onClick={() => setSyncOpen(true)}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Sync League
          </Button>
          <Link href="/leagues/new" className="inline-flex">
            <Button size="lg" className="font-heading text-xl h-12 uppercase tracking-wide">
              <Plus className="mr-2 h-5 w-5" /> Create League
            </Button>
          </Link>
        </div>
      </div>
      <SyncLeagueModal open={syncOpen} onOpenChange={setSyncOpen} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard">
          <Card className="bg-card/60 hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <div>
                <div className="font-heading text-xl uppercase">Dashboard</div>
                <div className="text-sm text-muted-foreground">League command overview</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/leagues/1/draft">
          <Card className="bg-card/60 hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <Swords className="h-8 w-8 text-primary" />
              <div>
                <div className="font-heading text-xl uppercase">Draft Board</div>
                <div className="text-sm text-muted-foreground">Enter the live draft room</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <button type="button" className="text-left" onClick={() => setSyncOpen(true)}>
          <Card className="h-full bg-card/60 hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <RefreshCw className="h-8 w-8 text-primary" />
              <div>
                <div className="font-heading text-xl uppercase">Sync League</div>
                <div className="text-sm text-muted-foreground">Import from Sleeper, ESPN, or Yahoo</div>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50 rounded-t-lg" />
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : leagueList.length === 0 ? (
        <Card className="text-center py-20 bg-card/50 border-dashed border-2">
          <CardContent className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-heading mb-2">No Leagues Found</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your command center is empty. Create a new league to start your draft day experience.
            </p>
            <Link href="/leagues/new">
              <Button size="lg" className="font-heading text-xl uppercase tracking-wide">
                Create Your First League
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagueList.map((league) => (
            <Card key={league.id} className="hover:border-primary/50 transition-colors bg-card/60 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={league.status === 'drafting' ? 'default' : 'secondary'} className="uppercase">
                    {league.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="uppercase bg-background/50">{league.theme.replace('_', ' ')}</Badge>
                </div>
                <CardTitle className="text-2xl font-heading truncate">{league.name}</CardTitle>
                <CardDescription>Commish: {league.commissionerName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{league.numTeams} Teams</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{league.numRounds} Rounds</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    <span className="uppercase">{league.scoringType.replace('_', ' ')}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/leagues/${league.id}`} className="w-full">
                  <Button variant="secondary" className="w-full font-heading text-lg tracking-wide uppercase">
                    Enter League
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
