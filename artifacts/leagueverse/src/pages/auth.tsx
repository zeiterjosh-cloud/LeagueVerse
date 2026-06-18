import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setLocalUser } from "@/lib/auth";
import { ShieldCheck } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex@leagueverse.local");
  const [role, setRole] = useState<"commissioner" | "owner">("commissioner");

  return (
    <div className="container max-w-xl mx-auto px-4 py-12">
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="font-heading text-3xl flex items-center gap-2"><ShieldCheck className="text-primary" /> Sign In</CardTitle>
          <CardDescription>Local mock authentication for MVP testing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as "commissioner" | "owner")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="commissioner">Commissioner</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full font-heading uppercase" onClick={() => { setLocalUser({ name, email, role }); setLocation("/dashboard"); }}>
            Continue to LeagueVerse
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
