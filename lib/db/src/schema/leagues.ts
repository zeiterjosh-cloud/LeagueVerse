import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaguesTable = pgTable("leagues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  commissionerName: text("commissioner_name").notNull(),
  numTeams: integer("num_teams").notNull().default(12),
  numRounds: integer("num_rounds").notNull().default(15),
  draftType: text("draft_type").notNull().default("snake"),
  scoringType: text("scoring_type").notNull().default("ppr"),
  status: text("status").notNull().default("setup"),
  theme: text("theme").notNull().default("nfl"),
  timerSeconds: integer("timer_seconds"),
  platformSource: text("platform_source"),
  externalId: text("external_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeagueSchema = createInsertSchema(leaguesTable).omit({ id: true, createdAt: true });
export type InsertLeague = z.infer<typeof insertLeagueSchema>;
export type League = typeof leaguesTable.$inferSelect;
