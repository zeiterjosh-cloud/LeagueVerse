import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const picksTable = pgTable("picks", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").notNull(),
  teamId: integer("team_id").notNull(),
  playerId: integer("player_id").notNull(),
  round: integer("round").notNull(),
  pickInRound: integer("pick_in_round").notNull(),
  overallPick: integer("overall_pick").notNull(),
  grade: text("grade"),
  gradeExplanation: text("grade_explanation"),
  valueScore: real("value_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPickSchema = createInsertSchema(picksTable).omit({ id: true, createdAt: true });
export type InsertPick = z.infer<typeof insertPickSchema>;
export type Pick = typeof picksTable.$inferSelect;
