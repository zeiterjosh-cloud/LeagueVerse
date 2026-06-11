import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateLeague } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trophy, Settings, Users, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "League name is required"),
  commissionerName: z.string().min(2, "Commissioner name is required"),
  numTeams: z.coerce.number().min(4).max(20),
  numRounds: z.coerce.number().min(10).max(20),
  draftType: z.enum(["snake", "auction", "linear"]),
  scoringType: z.enum(["standard", "ppr", "half_ppr"]),
  theme: z.enum(["nfl", "wwe", "star_wars", "marvel", "cyberpunk", "sports_bar", "vegas"]),
  timerSeconds: z.coerce.number().min(15).max(300).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewLeague() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createLeague = useCreateLeague();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      commissionerName: "",
      numTeams: 12,
      numRounds: 15,
      draftType: "snake",
      scoringType: "ppr",
      theme: "nfl",
      timerSeconds: 60,
    },
  });

  const onSubmit = (data: FormValues) => {
    createLeague.mutate({ data }, {
      onSuccess: (league) => {
        toast({ title: "League Created", description: "Welcome to the command center." });
        setLocation(`/leagues/${league.id}`);
      },
      onError: (err) => {
        toast({ title: "Error", description: "Failed to create league.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-heading mb-4">Initialize League</h1>
        <p className="text-muted-foreground text-lg">Configure your draft command center settings.</p>
      </div>

      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-heading flex items-center gap-2">
            <Settings className="text-primary" /> Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>League Name</FormLabel>
                    <FormControl><Input placeholder="e.g. The Gridiron Masters" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="commissionerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commissioner Name</FormLabel>
                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="numTeams" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Teams</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="numRounds" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Draft Rounds</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="draftType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Draft Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="snake">Snake</SelectItem>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="auction">Auction</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="scoringType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scoring Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="half_ppr">Half PPR</SelectItem>
                        <SelectItem value="ppr">PPR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="theme" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Draft Board Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="nfl">NFL Stadium</SelectItem>
                        <SelectItem value="cyberpunk">Cyberpunk Neon</SelectItem>
                        <SelectItem value="vegas">Las Vegas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timerSeconds" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pick Timer (seconds)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              
              <div className="pt-6 flex justify-end">
                <Button type="submit" size="lg" className="font-heading text-xl h-14 px-8 uppercase" disabled={createLeague.isPending}>
                  {createLeague.isPending ? "Initializing..." : "Initialize Command Center"} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
