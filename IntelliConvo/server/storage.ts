import { 
  users, type User, type InsertUser,
  transcripts, type Transcript, type InsertTranscript,
  messages, type Message, type InsertMessage,
  topics, type Topic, type InsertTopic,
  actionItems, type ActionItem, type InsertActionItem
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transcript methods
  getTranscript(id: number): Promise<Transcript | undefined>;
  getTranscripts(userId?: number): Promise<Transcript[]>;
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;
  updateTranscript(id: number, data: Partial<Transcript>): Promise<Transcript | undefined>;
  
  // Message methods
  getMessages(transcriptId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, data: Partial<Message>): Promise<Message | undefined>;
  
  // Topic methods
  getTopics(transcriptId: number): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Action Item methods
  getActionItems(transcriptId: number): Promise<ActionItem[]>;
  createActionItem(actionItem: InsertActionItem): Promise<ActionItem>;
  updateActionItem(id: number, data: Partial<ActionItem>): Promise<ActionItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getTranscript(id: number): Promise<Transcript | undefined> {
    const [transcript] = await db.select().from(transcripts).where(eq(transcripts.id, id));
    return transcript || undefined;
  }
  
  async getTranscripts(userId?: number): Promise<Transcript[]> {
    if (userId) {
      return db.select().from(transcripts).where(eq(transcripts.userId, userId));
    }
    return db.select().from(transcripts);
  }
  
  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const [transcript] = await db
      .insert(transcripts)
      .values(insertTranscript)
      .returning();
    return transcript;
  }
  
  async updateTranscript(id: number, data: Partial<Transcript>): Promise<Transcript | undefined> {
    const [updatedTranscript] = await db
      .update(transcripts)
      .set(data)
      .where(eq(transcripts.id, id))
      .returning();
    return updatedTranscript || undefined;
  }
  
  async getMessages(transcriptId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.transcriptId, transcriptId))
      .orderBy(messages.timestamp);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }
  
  async updateMessage(id: number, data: Partial<Message>): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set(data)
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage || undefined;
  }
  
  async getTopics(transcriptId: number): Promise<Topic[]> {
    return db
      .select()
      .from(topics)
      .where(eq(topics.transcriptId, transcriptId));
  }
  
  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const [topic] = await db
      .insert(topics)
      .values(insertTopic)
      .returning();
    return topic;
  }
  
  async getActionItems(transcriptId: number): Promise<ActionItem[]> {
    return db
      .select()
      .from(actionItems)
      .where(eq(actionItems.transcriptId, transcriptId));
  }
  
  async createActionItem(insertActionItem: InsertActionItem): Promise<ActionItem> {
    const [actionItem] = await db
      .insert(actionItems)
      .values(insertActionItem)
      .returning();
    return actionItem;
  }
  
  async updateActionItem(id: number, data: Partial<ActionItem>): Promise<ActionItem | undefined> {
    const [updatedActionItem] = await db
      .update(actionItems)
      .set(data)
      .where(eq(actionItems.id, id))
      .returning();
    return updatedActionItem || undefined;
  }
}

export const storage = new DatabaseStorage();