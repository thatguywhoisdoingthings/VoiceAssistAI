import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Transcript (collection of messages in a conversation)
export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  summary: text("summary"),
  userId: integer("user_id").references(() => users.id),
});

export const insertTranscriptSchema = createInsertSchema(transcripts).pick({
  title: true,
  summary: true,
  userId: true,
});

export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;

// Message (individual speech entries in a transcript)
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  transcriptId: integer("transcript_id").references(() => transcripts.id).notNull(),
  text: text("text").notNull(),
  speakerType: text("speaker_type").notNull(), // 'user', 'other'
  speakerName: text("speaker_name"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isActionItem: boolean("is_action_item").default(false),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  transcriptId: true,
  text: true,
  speakerType: true,
  speakerName: true,
  isActionItem: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Topics (topic keywords detected in a transcript)
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  transcriptId: integer("transcript_id").references(() => transcripts.id).notNull(),
  topic: text("topic").notNull(),
  weight: integer("weight").default(1),
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  transcriptId: true,
  topic: true,
  weight: true,
});

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

// Action Items (tasks detected in a transcript)
export const actionItems = pgTable("action_items", {
  id: serial("id").primaryKey(),
  transcriptId: integer("transcript_id").references(() => transcripts.id).notNull(),
  messageId: integer("message_id").references(() => messages.id),
  text: text("text").notNull(),
  completed: boolean("completed").default(false),
});

export const insertActionItemSchema = createInsertSchema(actionItems).pick({
  transcriptId: true,
  messageId: true,
  text: true,
});

export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type ActionItem = typeof actionItems.$inferSelect;
