import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const draftStateTable = pgTable("draft_state", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").notNull().unique(),
  status: text("status").notNull().default("not_started"),
  currentOverallPick: integer("current_overall_pick").notNull().default(1),
  currentRound: integer("current_round").notNull().default(1),
  currentPickInRound: integer("current_pick_in_round").notNull().default(1),
  onTheClockTeamId: integer("on_the_clock_team_id"),
  lastPickId: integer("last_pick_id"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDraftStateSchema = createInsertSchema(draftStateTable).omit({ id: true, updatedAt: true });
export type InsertDraftState = z.infer<typeof insertDraftStateSchema>;
export type DraftState = typeof draftStateTable.$inferSelect;
