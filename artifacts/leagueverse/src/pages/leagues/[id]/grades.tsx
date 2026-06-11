import { useParams } from "wouter";
import { useGetDraftGrades, getGetDraftGradesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DraftGrades() {
  const { id } = useParams();
  const leagueId = Number(id);

  const { data: grades } = useGetDraftGrades(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetDraftGradesQueryKey(leagueId) }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-heading mb-8">Draft Grades</h1>
      
      <div className="grid gap-6">
        {grades?.map(grade => (
          <Card key={grade.teamId} className="glass-panel border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-3xl">{grade.teamName}</CardTitle>
              <div className="font-heading text-5xl grade-a">{grade.overallGrade}</div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{grade.summary}</p>
              <div className="flex gap-4">
                {Object.entries(grade.positionalGrades).map(([pos, g]) => (
                  <div key={pos} className="text-center p-2 bg-background rounded border border-border flex-1">
                    <div className="text-xs text-muted-foreground font-mono">{pos}</div>
                    <div className="font-bold font-heading text-xl">{g}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
