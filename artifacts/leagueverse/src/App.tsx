import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Players from "@/pages/players";
import Owners from "@/pages/owners";
import OwnerProfile from "@/pages/owner-profile";
import HallOfFame from "@/pages/hall-of-fame";
import Rivalries from "@/pages/rivalries";
import History from "@/pages/history";
import BroadcastPage from "@/pages/broadcast-page";
import TeamManager from "@/pages/team-manager";
import NewLeague from "@/pages/leagues/new";
import LeagueOverview from "@/pages/leagues/[id]";
import DraftBoard from "@/pages/leagues/[id]/draft";
import TeamRoster from "@/pages/leagues/[id]/teams/[teamId]";
import DraftGrades from "@/pages/leagues/[id]/grades";
import Layout from "@/components/layout";

const queryClient = new QueryClient();

const DraftLotteryShow = () => <BroadcastPage slug="draft-lottery" />;
const AIScoutingReport = () => <BroadcastPage slug="scouting-report" />;
const GMProfile = () => <BroadcastPage slug="gm-profile" />;
const Matchmaking = () => <BroadcastPage slug="matchmaking" />;
const DraftOrderReveal = () => <BroadcastPage slug="draft-order" />;
const WalkUpExperience = () => <BroadcastPage slug="walk-up" />;
const AIWarRoom = () => <BroadcastPage slug="war-room" />;
const ChampionshipSimulator = () => <BroadcastPage slug="championship-simulator" />;
const DraftPickCommentary = () => <BroadcastPage slug="draft-commentary" />;
const LiveOddsEngine = () => <BroadcastPage slug="live-odds" />;
const DraftGradesShow = () => <BroadcastPage slug="draft-grades" />;
const DraftRecapShow = () => <BroadcastPage slug="draft-recap" />;
const DraftDocumentary = () => <BroadcastPage slug="draft-documentary" />;
const RunMyFranchise = () => <BroadcastPage slug="run-franchise" />;
const AITradeAgent = () => <BroadcastPage slug="trade-agent" />;
const WeeklyPriorities = () => <BroadcastPage slug="weekly-priorities" />;
const TeamImprovements = () => <BroadcastPage slug="team-improvements" />;
const ChampionshipTracker = () => <BroadcastPage slug="championship-tracker" />;

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route path="/dashboard" component={Home} />
        <Route path="/players" component={Players} />
        <Route path="/owners" component={Owners} />
        <Route path="/owners/:id" component={OwnerProfile} />
        <Route path="/profile" component={OwnerProfile} />
        <Route path="/hall-of-fame" component={HallOfFame} />
        <Route path="/rivalries" component={Rivalries} />
        <Route path="/history" component={History} />
        <Route path="/draft-lottery" component={DraftLotteryShow} />
        <Route path="/scouting-report" component={AIScoutingReport} />
        <Route path="/gm-profile" component={GMProfile} />
        <Route path="/matchmaking" component={Matchmaking} />
        <Route path="/draft-order" component={DraftOrderReveal} />
        <Route path="/walk-up" component={WalkUpExperience} />
        <Route path="/war-room" component={AIWarRoom} />
        <Route path="/championship-simulator" component={ChampionshipSimulator} />
        <Route path="/draft-commentary" component={DraftPickCommentary} />
        <Route path="/live-odds" component={LiveOddsEngine} />
        <Route path="/draft-grades" component={DraftGradesShow} />
        <Route path="/draft-recap" component={DraftRecapShow} />
        <Route path="/draft-documentary" component={DraftDocumentary} />
        <Route path="/run-franchise" component={RunMyFranchise} />
        <Route path="/trade-agent" component={AITradeAgent} />
        <Route path="/weekly-priorities" component={WeeklyPriorities} />
        <Route path="/team-improvements" component={TeamImprovements} />
        <Route path="/championship-tracker" component={ChampionshipTracker} />
        <Route path="/team-manager" component={TeamManager} />
        <Route path="/leagues/new" component={NewLeague} />
        <Route path="/leagues/:id" component={LeagueOverview} />
        <Route path="/leagues/:id/draft" component={DraftBoard} />
        <Route path="/leagues/:id/teams/:teamId" component={TeamRoster} />
        <Route path="/leagues/:id/grades" component={DraftGrades} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
