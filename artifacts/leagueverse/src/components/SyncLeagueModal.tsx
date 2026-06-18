import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw, ChevronRight, ChevronLeft, Check, AlertCircle,
  Loader2, Users, Trophy, Settings, ExternalLink
} from "lucide-react";
import { getListLeaguesQueryKey } from "@workspace/api-client-react";

type Platform = "sleeper" | "espn" | "yahoo";
type Step = "platform" | "credentials" | "leagues" | "done";

interface SyncLeagueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LeaguePreview {
  externalId: string;
  name: string;
  numTeams: number;
  numRounds: number;
  scoringType: string;
  draftType: string;
  season?: string;
}

const PLATFORM_INFO: Record<Platform, { label: string; color: string; logo: string; description: string }> = {
  sleeper: {
    label: "Sleeper",
    color: "from-purple-600 to-purple-800",
    logo: "💤",
    description: "Free public API — just enter your username",
  },
  espn: {
    label: "ESPN Fantasy",
    color: "from-red-600 to-red-800",
    logo: "🏈",
    description: "Enter your league ID and season year",
  },
  yahoo: {
    label: "Yahoo Fantasy",
    color: "from-purple-700 to-indigo-800",
    logo: "Y!",
    description: "OAuth 2.0 — requires Yahoo Fantasy app credentials",
  },
};

export function SyncLeagueModal({ open, onOpenChange }: SyncLeagueModalProps) {
  const qc = useQueryClient();

  const [step, setStep] = useState<Step>("platform");
  const [platform, setPlatform] = useState<Platform | null>(null);

  // Sleeper
  const [sleeperUsername, setSleeperUsername] = useState("");
  const [sleeperSeason, setSleeperSeason] = useState(String(new Date().getFullYear()));
  const [sleeperUserId, setSleeperUserId] = useState("");
  const [sleeperDisplayName, setSleeperDisplayName] = useState("");

  // ESPN
  const [espnLeagueId, setEspnLeagueId] = useState("");
  const [espnSeason, setEspnSeason] = useState(String(new Date().getFullYear()));
  const [espnS2, setEspnS2] = useState("");
  const [espnSwid, setEspnSwid] = useState("");
  const [espnPrivate, setEspnPrivate] = useState(false);

  // Yahoo
  const [yahooState, setYahooState] = useState("");
  const [yahooReady, setYahooReady] = useState(false);
  const [yahooNotConfigured, setYahooNotConfigured] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shared
  const [leagues, setLeagues] = useState<LeaguePreview[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<LeaguePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [importedId, setImportedId] = useState<number | null>(null);

  function reset() {
    setStep("platform");
    setPlatform(null);
    setSleeperUsername("");
    setSleeperUserId("");
    setSleeperDisplayName("");
    setEspnLeagueId("");
    setEspnS2("");
    setEspnSwid("");
    setEspnPrivate(false);
    setYahooState("");
    setYahooReady(false);
    setYahooNotConfigured(false);
    setLeagues([]);
    setSelectedLeague(null);
    setLoading(false);
    setImporting(false);
    setError("");
    setImportedId(null);
    if (pollRef.current) clearInterval(pollRef.current);
  }

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  // Yahoo OAuth message listener
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== "yahoo-oauth") return;
      if (e.data.success && e.data.state) {
        setYahooState(e.data.state);
        setYahooReady(true);
        if (pollRef.current) clearInterval(pollRef.current);
        fetchYahooLeagues(e.data.state);
      } else {
        setError(e.data.error ?? "Yahoo authorization failed");
        setLoading(false);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // ─── Sleeper ─────────────────────────────

  async function lookupSleeperUser() {
    if (!sleeperUsername.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/sync/sleeper/user/${encodeURIComponent(sleeperUsername.trim())}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "User not found");
      setSleeperUserId(data.userId);
      setSleeperDisplayName(data.displayName ?? data.username);
      await fetchSleeperLeagues(data.userId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to find user");
      setLoading(false);
    }
  }

  async function fetchSleeperLeagues(userId: string) {
    setLoading(true);
    try {
      const r = await fetch(`/api/sync/sleeper/leagues/${userId}/${sleeperSeason}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to fetch leagues");
      setLeagues(Array.isArray(data) ? data : []);
      setStep("leagues");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch leagues");
    } finally {
      setLoading(false);
    }
  }

  // ─── ESPN ─────────────────────────────────

  async function fetchEspnLeague() {
    if (!espnLeagueId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ leagueId: espnLeagueId, season: espnSeason });
      if (espnS2) params.set("espnS2", espnS2);
      if (espnSwid) params.set("swid", espnSwid);
      const r = await fetch(`/api/sync/espn/league?${params}`);
      const data = await r.json();
      if (!r.ok) {
        if (r.status === 401) setEspnPrivate(true);
        throw new Error(data.error ?? "League not found");
      }
      setLeagues([data]);
      setStep("leagues");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch league");
    } finally {
      setLoading(false);
    }
  }

  // ─── Yahoo ───────────────────────────────

  async function startYahooOAuth() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/sync/yahoo/auth");
      const data = await r.json();
      if (!r.ok) {
        if (data.setup) setYahooNotConfigured(true);
        throw new Error(data.error ?? "Yahoo not available");
      }
      if (data.mock) {
        setYahooState(data.state);
        setYahooReady(true);
        await fetchYahooLeagues(data.state);
        return;
      }
      setYahooState(data.state);
      const popup = window.open(data.authUrl, "yahoo-auth", "width=600,height=700,left=200,top=100");
      if (!popup) throw new Error("Popup blocked — please allow popups for this site");

      pollRef.current = setInterval(async () => {
        if (popup.closed) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (!yahooReady) {
            const sr = await fetch(`/api/sync/yahoo/status/${data.state}`).then(r => r.json());
            if (sr.status === "ready") {
              setYahooReady(true);
              fetchYahooLeagues(data.state);
            } else {
              setLoading(false);
            }
          }
        }
      }, 1000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Yahoo auth failed");
      setLoading(false);
    }
  }

  async function fetchYahooLeagues(state: string) {
    setLoading(true);
    try {
      const r = await fetch(`/api/sync/yahoo/leagues/${state}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to fetch leagues");
      setLeagues(Array.isArray(data) ? data : []);
      setStep("leagues");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch Yahoo leagues");
    } finally {
      setLoading(false);
    }
  }

  // ─── Import ──────────────────────────────

  async function importLeague() {
    if (!selectedLeague || !platform) return;
    setImporting(true);
    setError("");
    try {
      let r: Response;
      if (platform === "sleeper") {
        r = await fetch("/api/sync/sleeper/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leagueId: selectedLeague.externalId }),
        });
      } else if (platform === "espn") {
        r = await fetch("/api/sync/espn/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leagueId: espnLeagueId,
            season: espnSeason,
            espnS2: espnS2 || undefined,
            swid: espnSwid || undefined,
          }),
        });
      } else {
        r = await fetch("/api/sync/yahoo/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: yahooState, leagueKey: selectedLeague.externalId }),
        });
      }
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Import failed");
      setImportedId(data.id);
      setStep("done");
      await qc.invalidateQueries({ queryKey: getListLeaguesQueryKey() });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  // ─── Render ──────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            SYNC LEAGUE
          </DialogTitle>
          <DialogDescription>
            Import your existing fantasy league from a third-party platform.
          </DialogDescription>
        </DialogHeader>

        {step === "platform" && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Choose your fantasy platform:</p>
            <div className="grid grid-cols-1 gap-3">
              {(["sleeper", "espn", "yahoo"] as Platform[]).map((p) => {
                const info = PLATFORM_INFO[p];
                return (
                  <button
                    key={p}
                    onClick={() => { setPlatform(p); setStep("credentials"); setError(""); }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                      {info.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{info.label}</div>
                      <div className="text-sm text-muted-foreground">{info.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "credentials" && platform && (
          <div className="space-y-4 pt-2">
            <button
              onClick={() => { setStep("platform"); setError(""); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-3 w-3" /> Back
            </button>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${PLATFORM_INFO[platform].color} flex items-center justify-center text-white font-bold`}>
                {PLATFORM_INFO[platform].logo}
              </div>
              <div>
                <div className="font-semibold">{PLATFORM_INFO[platform].label}</div>
                <div className="text-xs text-muted-foreground">{PLATFORM_INFO[platform].description}</div>
              </div>
            </div>

            {error && (
              <Alert className="border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-2 p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="text-sm">{error}</span>
              </Alert>
            )}

            {platform === "sleeper" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Sleeper Username</Label>
                    <Input
                      placeholder="e.g. joshmahomes"
                      value={sleeperUsername}
                      onChange={(e) => setSleeperUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && lookupSleeperUser()}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Season</Label>
                    <Input
                      placeholder={String(new Date().getFullYear())}
                      value={sleeperSeason}
                      onChange={(e) => setSleeperSeason(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <Button onClick={lookupSleeperUser} disabled={!sleeperUsername.trim() || loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Looking up…</> : "Find My Leagues"}
                </Button>
              </div>
            )}

            {platform === "espn" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label>League ID</Label>
                    <Input
                      placeholder="e.g. 1234567"
                      value={espnLeagueId}
                      onChange={(e) => setEspnLeagueId(e.target.value)}
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">Found in your ESPN league URL</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Season</Label>
                    <Input
                      placeholder={String(new Date().getFullYear())}
                      value={espnSeason}
                      onChange={(e) => setEspnSeason(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>

                {(espnPrivate || espnS2) && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-400">Private League Credentials</p>
                      <p className="text-xs text-muted-foreground">
                        Get these from your browser cookies after logging into ESPN Fantasy.
                        Open DevTools → Application → Cookies → fantasy.espn.com
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label>espn_s2 Cookie</Label>
                        <Input
                          placeholder="AEB..."
                          value={espnS2}
                          onChange={(e) => setEspnS2(e.target.value)}
                          className="bg-background font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>SWID Cookie</Label>
                        <Input
                          placeholder="{XXXXXXXX-XXXX-...}"
                          value={espnSwid}
                          onChange={(e) => setEspnSwid(e.target.value)}
                          className="bg-background font-mono text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                {!espnPrivate && !espnS2 && (
                  <button
                    onClick={() => setEspnPrivate(true)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Private league? Add credentials →
                  </button>
                )}

                <Button onClick={fetchEspnLeague} disabled={!espnLeagueId.trim() || loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Fetching…</> : "Find League"}
                </Button>
              </div>
            )}

            {platform === "yahoo" && (
              <div className="space-y-4">
                {yahooNotConfigured ? (
                  <div className="space-y-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm font-medium text-amber-400">Yahoo Setup Required</p>
                    <p className="text-sm text-muted-foreground">
                      Yahoo requires API credentials. Register a free app at Yahoo Developer Console, then set:
                    </p>
                    <div className="font-mono text-xs bg-background/60 rounded p-2 space-y-1">
                      <div>YAHOO_CLIENT_ID=your_client_id</div>
                      <div>YAHOO_CLIENT_SECRET=your_client_secret</div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Redirect URI to register: <span className="font-mono text-primary">{window.location.origin}/api/sync/yahoo/callback</span>
                    </p>
                    <a
                      href="https://developer.yahoo.com/apps/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Open Yahoo Developer Console <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Click below to open Yahoo's authorization page. You'll be redirected back automatically.
                    </p>
                    {yahooReady && (
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <Check className="h-4 w-4" /> Yahoo connected — loading your leagues…
                      </div>
                    )}
                    <Button onClick={startYahooOAuth} disabled={loading || yahooReady} className="w-full">
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Waiting for authorization…</> : "Connect with Yahoo"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Opens a popup — make sure popups are allowed</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {step === "leagues" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setStep("credentials"); setError(""); setSelectedLeague(null); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3 w-3" /> Back
              </button>
              {sleeperDisplayName && (
                <Badge variant="secondary" className="text-xs">
                  @{sleeperDisplayName}
                </Badge>
              )}
            </div>

            {error && (
              <Alert className="border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-2 p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="text-sm">{error}</span>
              </Alert>
            )}

            {leagues.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p>No leagues found for this account / season.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {leagues.map((l) => (
                  <button
                    key={l.externalId as string}
                    onClick={() => setSelectedLeague(l)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedLeague?.externalId === l.externalId
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40 hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{l.name as string}</span>
                      {selectedLeague?.externalId === l.externalId && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {l.numTeams} teams</span>
                      <span className="flex items-center gap-1"><Settings className="h-3 w-3" /> {String(l.scoringType).toUpperCase()}</span>
                      {l.season && <span>{l.season as string} season</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <Button
              onClick={importLeague}
              disabled={!selectedLeague || importing}
              className="w-full"
            >
              {importing
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing…</>
                : selectedLeague
                  ? `Import "${selectedLeague.name as string}"`
                  : "Select a league to import"
              }
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-heading">LEAGUE SYNCED!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedLeague?.name as string} has been imported into LeagueVerse.
              </p>
            </div>
            {importedId && (
              <a href={`/leagues/${importedId}`} onClick={() => onOpenChange(false)}>
                <Button>Enter League →</Button>
              </a>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
