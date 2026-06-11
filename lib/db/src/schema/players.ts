import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playersTable = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  nflTeam: text("nfl_team").notNull(),
  rank: integer("rank").notNull(),
  adp: real("adp").notNull(),
  projectedPoints: real("projected_points").notNull(),
  byeWeek: integer("bye_week").notNull(),
  status: text("status").notNull().default("active"),
  injuryNote: text("injury_note"),
  isDrafted: boolean("is_drafted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlayerSchema = createInsertSchema(playersTable).omit({ id: true, createdAt: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;
