import { useParams } from "wouter";
import { useState, useMemo } from "react";
import { 
  useGetLeague, getGetLeagueQueryKey,
  useGetDraftBoard, getGetDraftBoardQueryKey,
  useGetDraftState, getGetDraftStateQueryKey,
  useListPlayers, getListPlayersQueryKey,
  useMakePick,
  useGetDraftActivity, getGetDraftActivityQueryKey,
  useGetPositionScarcity, getGetPositionScarcityQueryKey,
  useGetDraftRecommendations, getGetDraftRecommendationsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, ShieldAlert, Zap, Activity, TrendingUp, Flame } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function DraftBoard() {
  const { id } = useParams();
  const leagueId = Number(id);
  const [searchTerm, setSearchTerm] = useState("");
  const [posFilter, setPosFilter] = useState("");

  const { data: league } = useGetLeague(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetLeagueQueryKey(leagueId) }
  });
  
  const { data: draftState } = useGetDraftState(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetDraftStateQueryKey(leagueId), refetchInterval: 3000 }
  });

  const { data: draftBoard } = useGetDraftBoard(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetDraftBoardQueryKey(leagueId), refetchInterval: 3000 }
  });

  const { data: players } = useListPlayers({ available: true, leagueId, search: searchTerm, position: posFilter || undefined }, {
    query: { enabled: !!leagueId, queryKey: getListPlayersQueryKey({ available: true, leagueId, search: searchTerm, position: posFilter || undefined }) }
  });

  const { data: scarcity } = useGetPositionScarcity(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetPositionScarcityQueryKey(leagueId), refetchInterval: 5000 }
  });

  const { data: activity } = useGetDraftActivity(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetDraftActivityQueryKey(leagueId), refetchInterval: 3000 }
  });

  const { data: recommendations } = useGetDraftRecommendations(leagueId, {
    query: { enabled: !!leagueId && !!draftState?.onTheClockTeamId, queryKey: getGetDraftRecommendationsQueryKey(leagueId) }
  });

  const makePick = useMakePick();

  const handlePick = (playerId: number) => {
    if (!draftState?.onTheClockTeamId) return;
    makePick.mutate({ leagueId, data: { teamId: draftState.onTheClockTeamId, playerId } });
  };

  const onTheClockTeam = useMemo(() => {
    if (!draftState?.onTheClockTeamId || !draftBoard?.teams) return null;
    return draftBoard.teams.find(t => t.id === draftState.onTheClockTeamId);
  }, [draftState, draftBoard]);

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-background overflow-hidden">
      {/* On The Clock Banner */}
      <div className="h-20 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        <div className="flex items-center gap-6 z-10">
          <div className="font-heading text-4xl text-primary animate-pulse flex items-center gap-2">
            <Clock /> {draftState?.timerSecondsRemaining || 60}
          </div>
          <div>
            <div className="text-sm text-muted-foreground font-bold tracking-widest uppercase">On The Clock</div>
            <div className="font-heading text-3xl">{onTheClockTeam?.name || "Waiting..."}</div>
          </div>
        </div>
        <div className="text-right z-10">
          <div className="text-sm text-muted-foreground uppercase tracking-widest">Pick</div>
          <div className="font-heading text-3xl text-accent">{draftState?.currentRound}.{draftState?.currentPickInRound} (Overall {draftState?.currentOverallPick})</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - AI & Scarcity */}
        <div className="w-[300px] flex flex-col border-r border-border bg-card/30">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-card/50">
              <h3 className="font-heading text-xl flex items-center gap-2"><Flame className="text-accent h-5 w-5" /> Position Scarcity</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {scarcity?.map(s => (
                  <div key={s.position} className="space-y-1">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className={`text-${s.position.toLowerCase()}`}>{s.position}</span>
                      <span className={
                        s.scarcityLevel === 'critical' ? 'text-destructive' :
                        s.scarcityLevel === 'high' ? 'text-accent' :
                        'text-muted-foreground'
                      }>{s.scarcityLevel.toUpperCase()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <div className={`h-full ${
                        s.scarcityLevel === 'critical' ? 'bg-destructive' :
                        s.scarcityLevel === 'high' ? 'bg-accent' :
                        'bg-primary'
                      }`} style={{ width: `${Math.min(100, (s.totalAvailable / 50) * 100)}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Top 10: {s.top10Available}</span>
                      <span>Total: {s.totalAvailable}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden border-t border-border">
            <div className="p-4 border-b border-border bg-card/50">
              <h3 className="font-heading text-xl flex items-center gap-2"><Zap className="text-primary h-5 w-5" /> AI Assistant</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="text-sm mb-4 text-muted-foreground italic">{recommendations?.analysis}</div>
              <div className="space-y-3">
                {recommendations?.recommendations.map(rec => (
                  <div key={rec.playerId} className="p-3 bg-background border border-primary/20 rounded relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-sm truncate pr-2">{rec.playerName}</div>
                      <Badge variant="outline" className={`bg-${rec.position.toLowerCase()}/20 text-[10px] leading-none py-0 px-1 border-none`}>{rec.position}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{rec.reason}</div>
                    <Button size="sm" variant="secondary" className="w-full h-7 text-xs font-heading" onClick={() => handlePick(rec.playerId)} disabled={makePick.isPending}>
                      DRAFT
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Draft Board Grid */}
        <div className="flex-1 border-r border-border flex flex-col bg-background/50 relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <ScrollArea className="flex-1 p-6 relative z-10">
            <div className="min-w-max">
              <div className="flex gap-3 mb-3">
                {draftBoard?.teams.map(team => (
                  <div key={team.id} className="w-48 p-3 text-center font-heading text-xl bg-card border-b-2 border-primary rounded shadow-lg truncate">
                    {team.name}
                  </div>
                ))}
              </div>
              
              {Array.from({ length: draftBoard?.rounds || 15 }).map((_, roundIdx) => (
                <div key={roundIdx} className="flex gap-3 mb-3">
                   {draftBoard?.teams.map((team, teamIdx) => {
                     const pickNum = roundIdx % 2 === 0 ? teamIdx + 1 : draftBoard.teams.length - teamIdx;
                     const overall = roundIdx * draftBoard.teams.length + pickNum;
                     const pick = draftBoard.picks.find(p => p.overallPick === overall);
                     const isCurrentPick = draftState?.currentOverallPick === overall;
                     
                     return (
                       <motion.div key={`${roundIdx}-${team.id}`} 
                         initial={false}
                         animate={{ scale: isCurrentPick ? 1.05 : 1, boxShadow: isCurrentPick ? '0 0 20px hsl(var(--primary)/0.5)' : 'none' }}
                         className={`w-48 h-24 p-2 rounded border relative overflow-hidden flex flex-col justify-center items-center text-center transition-all duration-300
                         ${pick ? `bg-${pick.player?.position.toLowerCase()}` : isCurrentPick ? 'bg-primary/20 border-primary' : 'bg-card/50 border-border'}
                       `}>
                         <div className="absolute top-1 left-1 text-[10px] font-bold opacity-50">{roundIdx+1}.{pickNum}</div>
                         {pick ? (
                           <>
                             <div className="font-bold text-[15px] leading-tight truncate w-full px-1">{pick.player?.name}</div>
                             <div className="text-[11px] font-mono opacity-80 mt-1">{pick.player?.position} - {pick.player?.nflTeam}</div>
                           </>
                         ) : (
                           <div className={`text-2xl font-heading ${isCurrentPick ? 'text-primary animate-pulse' : 'text-muted-foreground/30'}`}>{overall}</div>
                         )}
                       </motion.div>
                     )
                   })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - Players & Activity */}
        <div className="w-[380px] flex flex-col bg-card/50">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-heading text-xl mb-3 flex items-center gap-2">Available Players</h3>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 bg-background" />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
                  {['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(pos => (
                    <Badge key={pos} variant={posFilter === (pos === 'ALL' ? '' : pos) ? 'default' : 'outline'}
                      className="cursor-pointer font-mono px-2 py-0.5 text-xs" onClick={() => setPosFilter(pos === 'ALL' ? '' : pos)}>
                      {pos}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                <AnimatePresence>
                  {players?.map(player => (
                    <motion.div key={player.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-background border border-border rounded-lg flex items-center justify-between hover:border-primary/50 transition-colors group relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${player.position.toLowerCase()}`} />
                      <div className="pl-2">
                        <div className="font-bold text-sm">{player.name}</div>
                        <div className="text-xs flex gap-2 font-mono mt-1">
                          <span className={`text-${player.position.toLowerCase()}`}>{player.position}</span>
                          <span className="text-muted-foreground">{player.nflTeam}</span>
                          <span className="text-muted-foreground">BYE {player.byeWeek}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handlePick(player.id)} disabled={makePick.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity uppercase font-heading tracking-wide">
                        Draft
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          {/* Activity Feed */}
          <div className="h-64 flex flex-col border-t border-border bg-card">
            <div className="p-3 border-b border-border bg-card/80 backdrop-blur-sm flex justify-between items-center">
              <h3 className="font-heading text-lg flex items-center gap-2"><Activity className="h-4 w-4" /> Live Feed</h3>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {activity?.map(act => (
                  <div key={act.id} className="text-sm flex gap-3 pb-3 border-b border-border/50 last:border-0">
                    <div className="text-xs text-muted-foreground font-mono whitespace-nowrap mt-0.5">
                      {new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div>
                      {act.type === 'pick' ? (
                        <span><strong className="text-primary">{act.teamName}</strong> drafted <strong>{act.playerName}</strong></span>
                      ) : act.type === 'grade' ? (
                        <span><strong className="text-primary">{act.teamName}</strong> got a <strong className="text-accent">{act.grade}</strong></span>
                      ) : (
                        <span className="text-muted-foreground">{act.message}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
