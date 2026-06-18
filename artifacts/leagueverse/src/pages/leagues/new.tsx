import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateLeague } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Crown, Shield, Trophy, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "League name is required"),
  commissionerName: z.string().min(2, "Commissioner name is required"),
  leagueType: z.enum(["redraft", "dynasty", "keeper"]),
  numTeams: z.coerce.number().min(4).max(20),
  numRounds: z.coerce.number().min(10).max(25),
  draftType: z.enum(["snake", "auction", "linear"]),
  scoringType: z.enum(["standard", "ppr", "half_ppr"]),
  passingTouchdown: z.coerce.number().min(4).max(6),
  receptionBonus: z.coerce.number().min(0).max(1.5),
  tightEndPremium: z.boolean(),
  superflex: z.boolean(),
  theme: z.enum(["nfl", "cyberpunk", "vegas"]),
  timerSeconds: z.coerce.number().min(15).max(300),
});

type FormValues = z.infer<typeof formSchema>;
type Step = 0 | 1 | 2 | 3;

const steps = ["Identity", "Format", "Teams", "Scoring"];

const leagueTypes = [
  {
    value: "redraft",
    title: "Redraft",
    description: "Clean slate every season. Fast setup, classic draft-night energy.",
    icon: Trophy,
  },
  {
    value: "dynasty",
    title: "Dynasty",
    description: "Long-term roster building with startup draft and franchise continuity.",
    icon: Crown,
  },
  {
    value: "keeper",
    title: "Keeper",
    description: "Keep a core each season while preserving the annual draft room drama.",
    icon: Shield,
  },
] as const;

export default function NewLeague() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createLeague = useCreateLeague();
  const [step, setStep] = useState<Step>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Saturday Night League",
      commissionerName: "Commissioner",
      leagueType: "redraft",
      numTeams: 12,
      numRounds: 15,
      draftType: "snake",
      scoringType: "ppr",
      passingTouchdown: 4,
      receptionBonus: 1,
      tightEndPremium: false,
      superflex: false,
      theme: "nfl",
      timerSeconds: 60,
    },
  });

  const values = form.watch();

  const next = async () => {
    const fieldsByStep: Array<Array<keyof FormValues>> = [
      ["name", "commissionerName"],
      ["leagueType", "draftType", "theme"],
      ["numTeams", "numRounds", "timerSeconds"],
      ["scoringType", "passingTouchdown", "receptionBonus", "tightEndPremium", "superflex"],
    ];
    const valid = await form.trigger(fieldsByStep[step]);
    if (valid && step < 3) setStep((step + 1) as Step);
  };

  const onSubmit = (data: FormValues) => {
    createLeague.mutate({
      data: {
        name: data.name,
        commissionerName: data.commissionerName,
        numTeams: data.numTeams,
        numRounds: data.numRounds,
        draftType: data.draftType,
        scoringType: data.scoringType,
        theme: data.theme,
        timerSeconds: data.timerSeconds,
      },
    }, {
      onSuccess: (league) => {
        toast({ title: "League Created", description: `${data.leagueType.toUpperCase()} command center is ready.` });
        setLocation(`/leagues/${league.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create league.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_34rem)]">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">LEAGUE SETUP</Badge>
            <h1 className="text-4xl md:text-5xl font-heading mb-2">Create League Wizard</h1>
            <p className="text-muted-foreground max-w-2xl">
              Configure the command center, team count, scoring profile, and draft-night experience.
            </p>
          </div>
          <Card className="bg-card/70 min-w-[280px]">
            <CardContent className="p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>STEP {step + 1} OF {steps.length}</span>
                <span>{steps[step]}</span>
              </div>
              <Progress value={((step + 1) / steps.length) * 100} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <Card className="glass-panel border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">{steps[step]}</CardTitle>
              <CardDescription>
                {step === 0 && "Name the league and assign the commissioner."}
                {step === 1 && "Choose the league type and draft-room vibe."}
                {step === 2 && "Set roster scale and draft clock pace."}
                {step === 3 && "Tune scoring settings for your fantasy format."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {step === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>League Name</FormLabel>
                          <FormControl><Input className="h-12" placeholder="e.g. Prime Time Gridiron" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="commissionerName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commissioner</FormLabel>
                          <FormControl><Input className="h-12" placeholder="Your name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <FormField control={form.control} name="leagueType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>League Type</FormLabel>
                          <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {leagueTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <Label key={type.value} className={`p-4 rounded-lg border bg-card/70 cursor-pointer transition-colors ${field.value === type.value ? "border-primary shadow-[0_0_24px_hsl(var(--primary)/0.18)]" : "border-border hover:border-primary/50"}`}>
                                  <div className="flex items-center justify-between mb-4">
                                    <Icon className="h-6 w-6 text-primary" />
                                    <RadioGroupItem value={type.value} />
                                  </div>
                                  <div className="font-heading text-xl uppercase">{type.title}</div>
                                  <p className="text-sm text-muted-foreground mt-1 normal-case">{type.description}</p>
                                </Label>
                              );
                            })}
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="draftType" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Draft Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-12"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="snake">Snake</SelectItem>
                                <SelectItem value="linear">Linear</SelectItem>
                                <SelectItem value="auction">Auction</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="theme" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Draft Room Theme</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-12"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="nfl">ESPN Studio Dark</SelectItem>
                                <SelectItem value="cyberpunk">Neon War Room</SelectItem>
                                <SelectItem value="vegas">Vegas Big Board</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="numTeams" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teams</FormLabel>
                          <FormControl><Input className="h-12" type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="numRounds" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rounds</FormLabel>
                          <FormControl><Input className="h-12" type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="timerSeconds" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Draft Timer</FormLabel>
                          <FormControl><Input className="h-12" type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="scoringType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scoring Format</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="half_ppr">Half PPR</SelectItem>
                              <SelectItem value="ppr">Full PPR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="passingTouchdown" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing TD</FormLabel>
                          <FormControl><Input className="h-12" type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="receptionBonus" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reception Bonus</FormLabel>
                          <FormControl><Input className="h-12" type="number" step="0.5" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-1 gap-3">
                        <FormField control={form.control} name="tightEndPremium" render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-border bg-card/60 p-4">
                            <div>
                              <FormLabel>Tight End Premium</FormLabel>
                              <p className="text-sm text-muted-foreground">Boost TE receptions for deeper strategy.</p>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="superflex" render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-border bg-card/60 p-4">
                            <div>
                              <FormLabel>Superflex</FormLabel>
                              <p className="text-sm text-muted-foreground">Allow QB in the flex slot.</p>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1) as Step)} disabled={step === 0}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    {step < 3 ? (
                      <Button type="button" onClick={next}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={createLeague.isPending} className="font-heading uppercase tracking-wide">
                        {createLeague.isPending ? "Creating..." : "Launch LeagueVerse"}
                        <Zap className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="bg-card/70 h-fit">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Live Setup Card</CardTitle>
              <CardDescription>Your league profile updates as you configure it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                <div className="text-xs text-primary uppercase tracking-widest mb-1">{values.leagueType}</div>
                <div className="font-heading text-2xl">{values.name || "Untitled League"}</div>
                <div className="text-sm text-muted-foreground mt-1">Commissioner: {values.commissionerName || "TBD"}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-background/70 p-3">
                  <div className="text-muted-foreground">Teams</div>
                  <div className="font-heading text-xl flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {values.numTeams}</div>
                </div>
                <div className="rounded-lg bg-background/70 p-3">
                  <div className="text-muted-foreground">Rounds</div>
                  <div className="font-heading text-xl">{values.numRounds}</div>
                </div>
                <div className="rounded-lg bg-background/70 p-3">
                  <div className="text-muted-foreground">Scoring</div>
                  <div className="font-heading text-xl">{values.scoringType?.replace("_", " ")}</div>
                </div>
                <div className="rounded-lg bg-background/70 p-3">
                  <div className="text-muted-foreground">Clock</div>
                  <div className="font-heading text-xl">{values.timerSeconds}s</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
