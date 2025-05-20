import { 
  User, 
  InsertUser, 
  Vault, 
  InsertVault, 
  Recipient, 
  InsertRecipient, 
  ContentItem, 
  InsertContentItem, 
  Delivery, 
  InsertDelivery, 
  Activity, 
  InsertActivity,
  users,
  vaults,
  recipients,
  contentItems,
  deliveries,
  activities
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserStripeInfo(id: number, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    subscriptionExpiresAt?: Date;
  }): Promise<User | undefined>;
  
  // Vault methods
  getVault(id: number): Promise<Vault | undefined>;
  getVaultsByUserId(userId: number): Promise<Vault[]>;
  createVault(vault: InsertVault): Promise<Vault>;
  updateVault(id: number, vault: Partial<InsertVault>): Promise<Vault | undefined>;
  deleteVault(id: number): Promise<void>;
  
  // Recipient methods
  getRecipient(id: number): Promise<Recipient | undefined>;
  getRecipientsByUserId(userId: number): Promise<Recipient[]>;
  createRecipient(recipient: InsertRecipient): Promise<Recipient>;
  updateRecipient(id: number, recipient: Partial<InsertRecipient>): Promise<Recipient | undefined>;
  deleteRecipient(id: number): Promise<void>;
  
  // Content methods
  getContentItem(id: number): Promise<ContentItem | undefined>;
  getContentItemsByVaultId(vaultId: number): Promise<ContentItem[]>;
  getContentItemsByUserId(userId: number): Promise<ContentItem[]>;
  createContentItem(contentItem: InsertContentItem): Promise<ContentItem>;
  updateContentItem(id: number, contentItem: Partial<InsertContentItem>): Promise<ContentItem | undefined>;
  deleteContentItem(id: number): Promise<void>;
  
  // Delivery methods
  getDelivery(id: number): Promise<Delivery | undefined>;
  getDeliveriesByUserId(userId: number): Promise<Delivery[]>;
  getDeliveriesByRecipientId(recipientId: number): Promise<Delivery[]>;
  getDeliveriesByContentItemId(contentItemId: number): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: number, delivery: Partial<InsertDelivery>): Promise<Delivery | undefined>;
  deleteDelivery(id: number): Promise<void>;
  
  // Activity methods
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vaults: Map<number, Vault>;
  private recipients: Map<number, Recipient>;
  private contentItems: Map<number, ContentItem>;
  private deliveries: Map<number, Delivery>;
  private activities: Map<number, Activity>;
  
  private userId: number = 1;
  private vaultId: number = 1;
  private recipientId: number = 1;
  private contentItemId: number = 1;
  private deliveryId: number = 1;
  private activityId: number = 1;

  constructor() {
    this.users = new Map();
    this.vaults = new Map();
    this.recipients = new Map();
    this.contentItems = new Map();
    this.deliveries = new Map();
    this.activities = new Map();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(id: number, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    subscriptionExpiresAt?: Date;
  }): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      ...stripeInfo,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Vault methods
  async getVault(id: number): Promise<Vault | undefined> {
    return this.vaults.get(id);
  }

  async getVaultsByUserId(userId: number): Promise<Vault[]> {
    return Array.from(this.vaults.values()).filter(
      vault => vault.userId === userId
    );
  }

  async createVault(vaultData: InsertVault): Promise<Vault> {
    const id = this.vaultId++;
    const now = new Date();
    const vault: Vault = {
      ...vaultData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.vaults.set(id, vault);
    return vault;
  }

  async updateVault(id: number, vaultData: Partial<InsertVault>): Promise<Vault | undefined> {
    const existingVault = await this.getVault(id);
    if (!existingVault) return undefined;
    
    const updatedVault: Vault = {
      ...existingVault,
      ...vaultData,
      updatedAt: new Date()
    };
    
    this.vaults.set(id, updatedVault);
    return updatedVault;
  }

  async deleteVault(id: number): Promise<void> {
    // Delete associated content and deliveries first
    const contentItems = await this.getContentItemsByVaultId(id);
    for (const item of contentItems) {
      await this.deleteContentItem(item.id);
    }
    
    this.vaults.delete(id);
  }

  // Recipient methods
  async getRecipient(id: number): Promise<Recipient | undefined> {
    return this.recipients.get(id);
  }

  async getRecipientsByUserId(userId: number): Promise<Recipient[]> {
    return Array.from(this.recipients.values()).filter(
      recipient => recipient.userId === userId
    );
  }

  async createRecipient(recipientData: InsertRecipient): Promise<Recipient> {
    const id = this.recipientId++;
    const now = new Date();
    const recipient: Recipient = {
      ...recipientData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.recipients.set(id, recipient);
    return recipient;
  }

  async updateRecipient(id: number, recipientData: Partial<InsertRecipient>): Promise<Recipient | undefined> {
    const existingRecipient = await this.getRecipient(id);
    if (!existingRecipient) return undefined;
    
    const updatedRecipient: Recipient = {
      ...existingRecipient,
      ...recipientData,
      updatedAt: new Date()
    };
    
    this.recipients.set(id, updatedRecipient);
    return updatedRecipient;
  }

  async deleteRecipient(id: number): Promise<void> {
    // Delete associated deliveries first
    const deliveries = await this.getDeliveriesByRecipientId(id);
    for (const delivery of deliveries) {
      await this.deleteDelivery(delivery.id);
    }
    
    this.recipients.delete(id);
  }

  // Content methods
  async getContentItem(id: number): Promise<ContentItem | undefined> {
    return this.contentItems.get(id);
  }

  async getContentItemsByVaultId(vaultId: number): Promise<ContentItem[]> {
    return Array.from(this.contentItems.values()).filter(
      item => item.vaultId === vaultId
    );
  }

  async getContentItemsByUserId(userId: number): Promise<ContentItem[]> {
    return Array.from(this.contentItems.values()).filter(
      item => item.userId === userId
    );
  }

  async createContentItem(contentItemData: InsertContentItem): Promise<ContentItem> {
    const id = this.contentItemId++;
    const now = new Date();
    const contentItem: ContentItem = {
      ...contentItemData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.contentItems.set(id, contentItem);
    return contentItem;
  }

  async updateContentItem(id: number, contentItemData: Partial<InsertContentItem>): Promise<ContentItem | undefined> {
    const existingContentItem = await this.getContentItem(id);
    if (!existingContentItem) return undefined;
    
    const updatedContentItem: ContentItem = {
      ...existingContentItem,
      ...contentItemData,
      updatedAt: new Date()
    };
    
    this.contentItems.set(id, updatedContentItem);
    return updatedContentItem;
  }

  async deleteContentItem(id: number): Promise<void> {
    // Delete associated deliveries first
    const deliveries = await this.getDeliveriesByContentItemId(id);
    for (const delivery of deliveries) {
      await this.deleteDelivery(delivery.id);
    }
    
    this.contentItems.delete(id);
  }

  // Delivery methods
  async getDelivery(id: number): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async getDeliveriesByUserId(userId: number): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(
      delivery => delivery.userId === userId
    );
  }

  async getDeliveriesByRecipientId(recipientId: number): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(
      delivery => delivery.recipientId === recipientId
    );
  }

  async getDeliveriesByContentItemId(contentItemId: number): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(
      delivery => delivery.contentItemId === contentItemId
    );
  }

  async createDelivery(deliveryData: InsertDelivery): Promise<Delivery> {
    const id = this.deliveryId++;
    const now = new Date();
    const delivery: Delivery = {
      ...deliveryData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.deliveries.set(id, delivery);
    return delivery;
  }

  async updateDelivery(id: number, deliveryData: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const existingDelivery = await this.getDelivery(id);
    if (!existingDelivery) return undefined;
    
    const updatedDelivery: Delivery = {
      ...existingDelivery,
      ...deliveryData,
      updatedAt: new Date()
    };
    
    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  async deleteDelivery(id: number): Promise<void> {
    this.deliveries.delete(id);
  }

  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      activity => activity.userId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const now = new Date();
    const activity: Activity = {
      ...activityData,
      id,
      createdAt: now
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateUserStripeInfo(
    id: number, 
    stripeInfo: { 
      stripeCustomerId?: string; 
      stripeSubscriptionId?: string;
      subscriptionStatus?: string;
      subscriptionTier?: string;
      subscriptionExpiresAt?: Date;
    }
  ): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...stripeInfo, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Vault methods
  async getVault(id: number): Promise<Vault | undefined> {
    const [vault] = await db.select().from(vaults).where(eq(vaults.id, id));
    return vault;
  }

  async getVaultsByUserId(userId: number): Promise<Vault[]> {
    return await db.select().from(vaults).where(eq(vaults.userId, userId));
  }

  async createVault(vaultData: InsertVault): Promise<Vault> {
    const [vault] = await db.insert(vaults).values(vaultData).returning();
    return vault;
  }

  async updateVault(id: number, vaultData: Partial<InsertVault>): Promise<Vault | undefined> {
    const [updatedVault] = await db
      .update(vaults)
      .set({ ...vaultData, updatedAt: new Date() })
      .where(eq(vaults.id, id))
      .returning();
    return updatedVault;
  }

  async deleteVault(id: number): Promise<void> {
    // First, get associated content items
    const vaultContentItems = await this.getContentItemsByVaultId(id);
    
    // Delete associated deliveries for each content item
    for (const item of vaultContentItems) {
      await db.delete(deliveries).where(eq(deliveries.contentItemId, item.id));
    }
    
    // Delete the content items
    await db.delete(contentItems).where(eq(contentItems.vaultId, id));
    
    // Finally, delete the vault
    await db.delete(vaults).where(eq(vaults.id, id));
  }

  // Recipient methods
  async getRecipient(id: number): Promise<Recipient | undefined> {
    const [recipient] = await db.select().from(recipients).where(eq(recipients.id, id));
    return recipient;
  }

  async getRecipientsByUserId(userId: number): Promise<Recipient[]> {
    return await db.select().from(recipients).where(eq(recipients.userId, userId));
  }

  async createRecipient(recipientData: InsertRecipient): Promise<Recipient> {
    const [recipient] = await db.insert(recipients).values(recipientData).returning();
    return recipient;
  }

  async updateRecipient(id: number, recipientData: Partial<InsertRecipient>): Promise<Recipient | undefined> {
    const [updatedRecipient] = await db
      .update(recipients)
      .set({ ...recipientData, updatedAt: new Date() })
      .where(eq(recipients.id, id))
      .returning();
    return updatedRecipient;
  }

  async deleteRecipient(id: number): Promise<void> {
    // Delete associated deliveries first
    await db.delete(deliveries).where(eq(deliveries.recipientId, id));
    
    // Then delete the recipient
    await db.delete(recipients).where(eq(recipients.id, id));
  }

  // Content methods
  async getContentItem(id: number): Promise<ContentItem | undefined> {
    const [contentItem] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    return contentItem;
  }

  async getContentItemsByVaultId(vaultId: number): Promise<ContentItem[]> {
    return await db.select().from(contentItems).where(eq(contentItems.vaultId, vaultId));
  }

  async getContentItemsByUserId(userId: number): Promise<ContentItem[]> {
    return await db.select().from(contentItems).where(eq(contentItems.userId, userId));
  }

  async createContentItem(contentItemData: InsertContentItem): Promise<ContentItem> {
    const [contentItem] = await db.insert(contentItems).values(contentItemData).returning();
    return contentItem;
  }

  async updateContentItem(id: number, contentItemData: Partial<InsertContentItem>): Promise<ContentItem | undefined> {
    const [updatedContentItem] = await db
      .update(contentItems)
      .set({ ...contentItemData, updatedAt: new Date() })
      .where(eq(contentItems.id, id))
      .returning();
    return updatedContentItem;
  }

  async deleteContentItem(id: number): Promise<void> {
    // Delete associated deliveries first
    await db.delete(deliveries).where(eq(deliveries.contentItemId, id));
    
    // Then delete the content item
    await db.delete(contentItems).where(eq(contentItems.id, id));
  }

  // Delivery methods
  async getDelivery(id: number): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery;
  }

  async getDeliveriesByUserId(userId: number): Promise<Delivery[]> {
    return await db.select().from(deliveries).where(eq(deliveries.userId, userId));
  }

  async getDeliveriesByRecipientId(recipientId: number): Promise<Delivery[]> {
    return await db.select().from(deliveries).where(eq(deliveries.recipientId, recipientId));
  }

  async getDeliveriesByContentItemId(contentItemId: number): Promise<Delivery[]> {
    return await db.select().from(deliveries).where(eq(deliveries.contentItemId, contentItemId));
  }

  async createDelivery(deliveryData: InsertDelivery): Promise<Delivery> {
    const [delivery] = await db.insert(deliveries).values(deliveryData).returning();
    return delivery;
  }

  async updateDelivery(id: number, deliveryData: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const [updatedDelivery] = await db
      .update(deliveries)
      .set({ ...deliveryData, updatedAt: new Date() })
      .where(eq(deliveries.id, id))
      .returning();
    return updatedDelivery;
  }

  async deleteDelivery(id: number): Promise<void> {
    await db.delete(deliveries).where(eq(deliveries.id, id));
  }

  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(activityData).returning();
    return activity;
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
