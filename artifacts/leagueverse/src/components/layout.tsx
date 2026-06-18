import { Link } from "wouter";
import { Brain, Crown, History, LayoutDashboard, Plus, Swords, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Trophy className="h-6 w-6" />
            <span className="font-heading text-2xl tracking-wider pt-1">LeagueVerse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" className="font-heading uppercase tracking-wide">
                LeagueVerse vs Yahoo
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="font-heading uppercase tracking-wide">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Link href="/leagues/1/draft">
              <Button variant="ghost" className="font-heading uppercase tracking-wide">
                <Swords className="mr-2 h-4 w-4" /> Draft Board
              </Button>
            </Link>
            <Link href="/owners">
              <Button variant="ghost" className="font-heading uppercase tracking-wide">
                <Users className="mr-2 h-4 w-4" /> Owners
              </Button>
            </Link>
            <Link href="/hall-of-fame">
              <Button variant="ghost" className="font-heading uppercase tracking-wide">
                <Crown className="mr-2 h-4 w-4" /> Hall
              </Button>
            </Link>
            <Link href="/matchmaking">
              <Button variant="ghost" className="font-heading uppercase tracking-wide">
                <Brain className="mr-2 h-4 w-4" /> Universe
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" className="font-heading uppercase tracking-wide">
                <History className="mr-2 h-4 w-4" /> History
              </Button>
            </Link>
            <Link href="/leagues/new">
              <Button size="sm" className="font-heading uppercase tracking-wide">
                <Plus className="mr-2 h-4 w-4" /> Create League
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
