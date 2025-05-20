import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // Stripe fields for premium subscriptions
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("free"),
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  avatarUrl: true
});

// Vaults schema
export const vaults = pgTable("vaults", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  encryptionLevel: text("encryption_level").notNull(),
  isActive: boolean("is_active").default(true)
});

export const insertVaultSchema = createInsertSchema(vaults).pick({
  name: true,
  description: true,
  coverImage: true,
  userId: true,
  encryptionLevel: true,
  isActive: true
});

// Recipients schema
export const recipients = pgTable("recipients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  userId: integer("user_id").notNull().references(() => users.id),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  notificationPreferences: jsonb("notification_preferences"),
});

export const insertRecipientSchema = createInsertSchema(recipients).pick({
  name: true,
  email: true,
  phone: true,
  userId: true,
  isVerified: true,
  notificationPreferences: true
});

// Content items schema
export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  contentType: text("content_type").notNull(), // e.g., 'video', 'document', 'message'
  contentPath: text("content_path").notNull(),
  vaultId: integer("vault_id").notNull().references(() => vaults.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  encryptionKey: text("encryption_key"), // For client-side encryption
  thumbnailUrl: text("thumbnail_url"),
  metadata: jsonb("metadata")
});

export const insertContentItemSchema = createInsertSchema(contentItems).pick({
  title: true,
  description: true,
  contentType: true,
  contentPath: true,
  vaultId: true,
  userId: true,
  encryptionKey: true,
  thumbnailUrl: true,
  metadata: true
});

// Deliveries schema
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  contentItemId: integer("content_item_id").notNull().references(() => contentItems.id),
  recipientId: integer("recipient_id").notNull().references(() => recipients.id),
  userId: integer("user_id").notNull().references(() => users.id),
  scheduledDate: timestamp("scheduled_date"),
  triggerCondition: text("trigger_condition"), // For conditional triggers
  isDelivered: boolean("is_delivered").default(false),
  deliveredAt: timestamp("delivered_at"),
  deliveryMethod: text("delivery_method").default("email"), // email, sms, both
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDeliverySchema = createInsertSchema(deliveries).pick({
  contentItemId: true,
  recipientId: true,
  userId: true,
  scheduledDate: true,
  triggerCondition: true,
  isDelivered: true,
  deliveredAt: true,
  deliveryMethod: true,
  additionalNotes: true
});

// Activities schema for audit logs
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(), // e.g., 'vault', 'content', 'recipient'
  entityId: integer("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  details: true
});

// Subscription tiers schema
export const subscriptionTiers = pgTable("subscription_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents (e.g., $9.99 = 999)
  interval: text("interval").notNull().default("month"), // month, year
  features: jsonb("features").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).pick({
  name: true,
  description: true,
  price: true,
  interval: true,
  features: true,
  stripePriceId: true,
  isActive: true
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vault = typeof vaults.$inferSelect;
export type InsertVault = z.infer<typeof insertVaultSchema>;

export type Recipient = typeof recipients.$inferSelect;
export type InsertRecipient = z.infer<typeof insertRecipientSchema>;

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = z.infer<typeof insertSubscriptionTierSchema>;
