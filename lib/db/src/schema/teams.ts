import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teamsTable = pgTable("teams", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").notNull(),
  name: text("name").notNull(),
  ownerName: text("owner_name").notNull(),
  draftPosition: integer("draft_position").notNull(),
  logoUrl: text("logo_url"),
  walkUpSong: text("walk_up_song"),
  primaryColor: text("primary_color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeamSchema = createInsertSchema(teamsTable).omit({ id: true, createdAt: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teamsTable.$inferSelect;
