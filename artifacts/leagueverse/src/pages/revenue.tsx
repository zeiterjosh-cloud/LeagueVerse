import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, Sparkles, Trophy } from "lucide-react";

const revenueSections = [
  {
    title: "Sportsbook Affiliate Commissions",
    copy: "Affiliate payouts are the highest-margin revenue stream for a sports betting and news app. Focus on sign-ups and deposit conversions from trusted sportsbook partners.",
    bullets: [
      "CPA: $50–$400+ per qualifying new customer",
      "Revenue share: 20%–40% of sportsbook profit from referred players",
      "Hybrid deals: smaller CPA plus ongoing revenue share",
    ],
  },
  {
    title: "Early Stage Focus (0–10,000 users)",
    copy: "Start with sportsbook and fantasy affiliate programs plus local sponsorships. Build trust before scaling big ad placements.",
    bullets: [
      "DraftKings, FanDuel, BetMGM, Caesars, bet365",
      "PrizePicks, Underdog Fantasy for fantasy referrals",
      "Local or niche sponsor programs for early revenue",
    ],
  },
  {
    title: "Growth Stage (10,000–100,000 users)",
    copy: "Offer sponsored placement on premium content, daily alerts, and AI insights. Sponsors care about engagement more than raw installs.",
    bullets: [
      "Daily AI Pick of the Day presented by a partner",
      "Injury Report Center and Live Odds Dashboard sponsorships",
      "Push notification sponsorships with strict frequency limits",
    ],
  },
  {
    title: "Long-Term Mix",
    copy: "A diversified revenue model makes the app resilient. Sportsbook commissions should remain the largest source with subscriptions and sponsorships supporting growth.",
    bullets: [
      "35% sportsbook affiliate commissions",
      "30% subscriptions",
      "20% sponsorships",
      "10% advertising",
      "5% premium reports and tools",
    ],
  },
];

export default function Revenue() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-10">
      <div className="container mx-auto space-y-8">
        <div className="rounded-3xl border border-purple-500/20 bg-card/80 p-8 shadow-[0_0_80px_rgba(147,51,234,0.14)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 text-primary">
                <BarChart3 className="h-8 w-8" />
                <Badge variant="outline">Revenue Strategy</Badge>
              </div>
              <h1 className="mt-4 text-4xl font-heading text-white">Sports Betting & Affiliate Revenue</h1>
              <p className="mt-4 max-w-3xl text-muted-foreground text-lg">
                Build a high-value sports app revenue engine with sportsbook affiliate commissions, subscriptions, sponsorships, and premium tools.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="font-heading uppercase">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="font-heading uppercase">
                <Link href="/leagues/new">Create League Experience</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            {revenueSections.map((section) => (
              <Card key={section.title} className="bg-card/80 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{section.copy}</p>
                  <ul className="grid gap-2 text-sm text-purple-100/90">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="rounded-xl border border-border bg-background/60 p-3">{bullet}</li>
                    ))}
                  </ul>
                  {section.title === "Early Stage Focus (0–10,000 users)" ? (
                    <div className="rounded-xl border border-border bg-background/60 p-4 text-sm">
                      <div className="font-semibold text-white">Recommended partner links</div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {[{
                          label: "DraftKings Affiliate",
                          href: "https://www.draftkings.com/?utm_source=chatgpt.com",
                        }, {
                          label: "FanDuel Affiliate",
                          href: "https://www.fanduel.com/?utm_source=chatgpt.com",
                        }, {
                          label: "BetMGM Affiliate",
                          href: "https://www.betmgm.com/?utm_source=chatgpt.com",
                        }, {
                          label: "Caesars Affiliate",
                          href: "https://www.caesars.com/sportsbook-and-casino?utm_source=chatgpt.com",
                        }, {
                          label: "bet365 Affiliate",
                          href: "https://www.bet365.com/?utm_source=chatgpt.com",
                        }].map((item) => (
                          <Button
                            key={item.href}
                            asChild
                            variant="outline"
                            className="w-full justify-start text-left text-sm"
                          >
                            <a href={item.href} target="_blank" rel="noreferrer">
                              {item.label}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="bg-card/80 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-2xl font-heading">Example Revenue Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-background/70 p-5 text-sm">
                  <div className="font-semibold text-white">Example</div>
                  <div className="mt-2 text-muted-foreground">10,000 users · 1,000 sportsbook offer clicks · 200 signups · $150 CPA</div>
                  <div className="mt-4 text-3xl font-heading text-primary">$30,000</div>
                  <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Affiliate commission revenue</div>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-yellow-300" />
                    <div className="font-semibold">Commission structure for marketplaces</div>
                  </div>
                  <div className="text-sm text-muted-foreground">For expert picks or handicapping marketplaces, keep creator share high and retain a service cut.</div>
                  <div className="rounded-xl bg-purple-950/60 p-4 text-sm text-white">
                    Pick package $20 → creator $14, platform $6 (70/30 split)
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-5">
                  <div className="flex items-center gap-3 text-white">
                    <Trophy className="h-6 w-6 text-primary" />
                    <div className="font-semibold">Premium sponsorship package</div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                    <div className="rounded-xl border border-border bg-background/80 p-4">
                      <div className="font-semibold">Gold Sponsor</div>
                      <div className="text-xs">$5,000/month — featured article, newsletter mention, branded AI tool placement</div>
                    </div>
                    <div className="rounded-xl border border-border bg-background/80 p-4">
                      <div className="font-semibold">Platinum Sponsor</div>
                      <div className="text-xs">$10,000+/month — exclusive category sponsorship, co-branded content, premium placement</div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    <Button asChild className="font-heading uppercase">
                      <a href="/revenue" className="w-full">Explore Sponsorship Ideas</a>
                    </Button>
                    <Button asChild variant="outline" className="font-heading uppercase">
                      <a href="/dashboard" className="w-full">Build Your Revenue Plan</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-2xl font-heading">Compliance & Ontario Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  If this app is targeted at Ontario users, review iGaming Ontario and AGCO rules before promoting sportsbooks. Regulatory compliance is essential for affiliate and advertising programs.
                </p>
                <div className="rounded-xl border border-border bg-background/70 p-4">
                  <div className="font-semibold text-white">Key considerations</div>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                    <li>Age-gated marketing and clear terms</li>
                    <li>Responsible gambling messaging</li>
                    <li>Province-specific affiliate disclosure rules</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
