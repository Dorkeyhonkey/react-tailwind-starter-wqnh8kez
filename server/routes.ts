import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertVaultSchema, 
  insertRecipientSchema, 
  insertContentItemSchema, 
  insertDeliverySchema,
  insertActivitySchema,
  User
} from "@shared/schema";
import { z } from "zod";
import { stripeService } from "./services/stripe";
import Stripe from "stripe";

// Extend Express Request interface to include session.user
declare module 'express-session' {
  interface SessionData {
    user: User;
    isAuthenticated: boolean;
  }
}

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // User Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Store user in session
      req.session.user = user;
      req.session.isAuthenticated = true;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      req.session.user = user;
      req.session.isAuthenticated = true;

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/session", (req, res) => {
    if (req.session.isAuthenticated && req.session.user) {
      const { password, ...userWithoutPassword } = req.session.user;
      return res.status(200).json({ 
        isAuthenticated: true, 
        user: userWithoutPassword 
      });
    }
    res.status(200).json({ isAuthenticated: false });
  });

  app.get("/api/users", async (req, res) => {
    try {
      // Check if email query parameter exists for Firebase integration
      if (req.query.email) {
        const email = req.query.email as string;
        const user = await storage.getUserByEmail(email);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      }
      
      // If no query parameters, return error
      return res.status(400).json({ message: "Missing required parameters" });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Vault Routes
  app.post("/api/vaults", async (req, res) => {
    try {
      const vaultData = insertVaultSchema.parse(req.body);
      const vault = await storage.createVault(vaultData);
      res.status(201).json(vault);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create vault" });
    }
  });

  app.get("/api/vaults", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const vaults = await storage.getVaultsByUserId(userId);
      res.status(200).json(vaults);
    } catch (error) {
      res.status(500).json({ message: "Failed to get vaults" });
    }
  });

  app.get("/api/vaults/:id", async (req, res) => {
    try {
      const vaultId = parseInt(req.params.id);
      const vault = await storage.getVault(vaultId);
      
      if (!vault) {
        return res.status(404).json({ message: "Vault not found" });
      }
      
      res.status(200).json(vault);
    } catch (error) {
      res.status(500).json({ message: "Failed to get vault" });
    }
  });

  app.put("/api/vaults/:id", async (req, res) => {
    try {
      const vaultId = parseInt(req.params.id);
      const vaultData = insertVaultSchema.partial().parse(req.body);
      const updatedVault = await storage.updateVault(vaultId, vaultData);
      
      if (!updatedVault) {
        return res.status(404).json({ message: "Vault not found" });
      }
      
      res.status(200).json(updatedVault);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update vault" });
    }
  });

  app.delete("/api/vaults/:id", async (req, res) => {
    try {
      const vaultId = parseInt(req.params.id);
      await storage.deleteVault(vaultId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vault" });
    }
  });

  // Recipient Routes
  app.post("/api/recipients", async (req, res) => {
    try {
      const recipientData = insertRecipientSchema.parse(req.body);
      const recipient = await storage.createRecipient(recipientData);
      res.status(201).json(recipient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create recipient" });
    }
  });

  app.get("/api/recipients", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const recipients = await storage.getRecipientsByUserId(userId);
      res.status(200).json(recipients);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recipients" });
    }
  });

  app.put("/api/recipients/:id", async (req, res) => {
    try {
      const recipientId = parseInt(req.params.id);
      const recipientData = insertRecipientSchema.partial().parse(req.body);
      const updatedRecipient = await storage.updateRecipient(recipientId, recipientData);
      
      if (!updatedRecipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      res.status(200).json(updatedRecipient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update recipient" });
    }
  });

  app.delete("/api/recipients/:id", async (req, res) => {
    try {
      const recipientId = parseInt(req.params.id);
      await storage.deleteRecipient(recipientId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipient" });
    }
  });

  // Content Routes
  app.post("/api/content", async (req, res) => {
    try {
      const contentData = insertContentItemSchema.parse(req.body);
      const content = await storage.createContentItem(contentData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create content" });
    }
  });

  app.get("/api/content", async (req, res) => {
    try {
      const vaultId = parseInt(req.query.vaultId as string);
      if (isNaN(vaultId)) {
        return res.status(400).json({ message: "Invalid vault ID" });
      }
      
      const contentItems = await storage.getContentItemsByVaultId(vaultId);
      res.status(200).json(contentItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get content items" });
    }
  });

  app.put("/api/content/:id", async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const contentData = insertContentItemSchema.partial().parse(req.body);
      const updatedContent = await storage.updateContentItem(contentId, contentData);
      
      if (!updatedContent) {
        return res.status(404).json({ message: "Content item not found" });
      }
      
      res.status(200).json(updatedContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update content" });
    }
  });

  app.delete("/api/content/:id", async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      await storage.deleteContentItem(contentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // Delivery Routes
  app.post("/api/deliveries", async (req, res) => {
    try {
      const deliveryData = insertDeliverySchema.parse(req.body);
      const delivery = await storage.createDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create delivery" });
    }
  });

  app.get("/api/deliveries", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const deliveries = await storage.getDeliveriesByUserId(userId);
      res.status(200).json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get deliveries" });
    }
  });

  app.put("/api/deliveries/:id", async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      const deliveryData = insertDeliverySchema.partial().parse(req.body);
      const updatedDelivery = await storage.updateDelivery(deliveryId, deliveryData);
      
      if (!updatedDelivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      
      res.status(200).json(updatedDelivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update delivery" });
    }
  });

  app.delete("/api/deliveries/:id", async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      await storage.deleteDelivery(deliveryId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete delivery" });
    }
  });

  // Activity Log Routes
  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity log" });
    }
  });

  app.get("/api/activities", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const activities = await storage.getActivitiesByUserId(userId);
      res.status(200).json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });
  
  // Stripe Payment Routes
  app.post("/api/payments/create-payment-intent", requireAuth, async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ message: "Stripe payment service is not configured" });
      }
      
      const { amount, currency = 'usd' } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const userId = req.session.user!.id;
      const paymentIntent = await stripeService.createPaymentIntent(userId, amount, currency);
      
      res.status(200).json(paymentIntent);
    } catch (error) {
      console.error('Payment intent error:', error);
      res.status(500).json({ 
        message: "Failed to create payment intent",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/subscriptions/create", requireAuth, async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ message: "Stripe subscription service is not configured" });
      }
      
      const { tierName } = req.body;
      
      if (!tierName) {
        return res.status(400).json({ message: "Subscription tier is required" });
      }
      
      const userId = req.session.user!.id;
      const subscription = await stripeService.createSubscription(userId, tierName);
      
      res.status(200).json(subscription);
    } catch (error) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ 
        message: "Failed to create subscription",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/subscriptions/cancel", requireAuth, async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ message: "Stripe subscription service is not configured" });
      }
      
      const userId = req.session.user!.id;
      await stripeService.cancelSubscription(userId);
      
      res.status(200).json({ message: "Subscription canceled successfully" });
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      res.status(500).json({ 
        message: "Failed to cancel subscription",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/subscriptions/status", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user's subscription information
      res.status(200).json({
        subscriptionStatus: user.subscriptionStatus || 'free',
        subscriptionTier: user.subscriptionTier || 'free',
        subscriptionExpiresAt: user.subscriptionExpiresAt || null,
      });
    } catch (error) {
      console.error('Subscription status error:', error);
      res.status(500).json({ 
        message: "Failed to get subscription status",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Stripe Webhook Endpoint
  app.post("/api/webhooks/stripe", async (req, res) => {
    // Retrieve the event by verifying the signature using the raw body
    let event: Stripe.Event;
    
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ message: "Stripe webhook service is not configured" });
      }
      
      // Create instance of Stripe to verify webhook
      const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16' as any,
      });
      
      event = stripeInstance.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err}`);
      return res.status(400).send(`Webhook Error: ${err}`);
    }
    
    try {
      // Handle the event
      await stripeService.handleWebhookEvent(event);
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook handling error:', error);
      res.status(500).json({ 
        message: "Error handling webhook event",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
