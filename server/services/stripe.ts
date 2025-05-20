import Stripe from 'stripe';
import { storage } from '../storage';
import { User } from '@shared/schema';
import * as fs from 'fs';

// Load Stripe key directly from .env file
let stripeSecretKey: string | undefined;
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  const match = envFile.match(/STRIPE_SECRET_KEY=([^\n]+)/);
  if (match) stripeSecretKey = match[1];
} catch (err) {
  console.error('Error reading .env file:', err);
}

// Check if Stripe API key is available
const hasStripeKey = !!stripeSecretKey;
console.log('Stripe integration ' + (hasStripeKey ? 'enabled' : 'disabled'));

// Initialize Stripe with your secret key if available, otherwise use a dummy implementation
let stripe: Stripe | null = null;
if (hasStripeKey) {
  stripe = new Stripe(stripeSecretKey!, {
    apiVersion: '2023-10-16' as any,
  });
}

export class StripeService {
  /**
   * Create a Stripe customer
   */
  async createCustomer(user: User): Promise<string> {
    try {
      // Check if Stripe is available
      if (!hasStripeKey || !stripe) {
        throw new Error('Stripe is not configured');
      }
      
      // Check if user already has a Stripe customer ID
      if (user.stripeCustomerId) {
        return user.stripeCustomerId;
      }

      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || user.username,
        metadata: {
          userId: String(user.id),
        },
      });

      // Update user with Stripe customer ID
      await storage.updateUserStripeInfo(user.id, {
        stripeCustomerId: customer.id,
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    userId: number,
    tierName: string
  ): Promise<{ clientSecret: string; subscriptionId: string }> {
    try {
      // Check if Stripe is available
      if (!hasStripeKey || !stripe) {
        throw new Error('Stripe is not configured');
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Ensure user has a Stripe customer ID
      const customerId = user.stripeCustomerId || await this.createCustomer(user);

      // Get subscription tier details
      // In a real app, this would come from the database
      const priceTiers = {
        'basic': 'price_basic123',
        'premium': 'price_premium456',
        'enterprise': 'price_enterprise789'
      };
      
      const priceId = priceTiers[tierName as keyof typeof priceTiers];
      if (!priceId) {
        throw new Error(`Invalid subscription tier: ${tierName}`);
      }

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Get the client secret
      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice.payment_intent as any;
      const clientSecret = paymentIntent.client_secret;

      if (!clientSecret) {
        throw new Error('No client secret found');
      }

      // Update user with subscription info
      await storage.updateUserStripeInfo(user.id, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionTier: tierName,
      });

      return {
        clientSecret,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Create a payment intent for one-time payment
   */
  async createPaymentIntent(
    userId: number,
    amount: number,
    currency: string = 'usd'
  ): Promise<{ clientSecret: string }> {
    try {
      // Check if Stripe is available
      if (!hasStripeKey || !stripe) {
        throw new Error('Stripe is not configured');
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Ensure user has a Stripe customer ID
      const customerId = user.stripeCustomerId || await this.createCustomer(user);

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      // Check if Stripe is available
      if (!hasStripeKey || !stripe) {
        throw new Error('Stripe is not configured');
      }
      
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: number): Promise<void> {
    try {
      // Check if Stripe is available
      if (!hasStripeKey || !stripe) {
        throw new Error('Stripe is not configured');
      }
      
      const user = await storage.getUser(userId);
      if (!user || !user.stripeSubscriptionId) {
        throw new Error('User or subscription not found');
      }

      await stripe.subscriptions.cancel(user.stripeSubscriptionId);

      // Update user with canceled subscription
      await storage.updateUserStripeInfo(user.id, {
        subscriptionStatus: 'canceled',
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Handle webhook events from Stripe
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      // Check if Stripe is available
      if (!hasStripeKey || !stripe) {
        throw new Error('Stripe is not configured');
      }
      
      switch (event.type) {
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionUpdated(subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionDeleted(subscription);
          break;
        }
        // Add more event handlers as needed
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Find user by Stripe customer ID
      const users = await this.findUserByStripeCustomerId(subscription.customer as string);
      if (!users) {
        throw new Error('User not found for customer: ' + subscription.customer);
      }

      // Update user with subscription info
      await storage.updateUserStripeInfo(users.id, {
        subscriptionStatus: subscription.status,
        subscriptionExpiresAt: new Date((subscription as any).current_period_end * 1000),
      });
    } catch (error) {
      console.error('Error handling subscription updated:', error);
      throw error;
    }
  }

  /**
   * Handle subscription deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Find user by Stripe customer ID
      const users = await this.findUserByStripeCustomerId(subscription.customer as string);
      if (!users) {
        throw new Error('User not found for customer: ' + subscription.customer);
      }

      // Update user with subscription info
      await storage.updateUserStripeInfo(users.id, {
        subscriptionStatus: 'canceled',
        subscriptionTier: 'free',
      });
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
      throw error;
    }
  }

  /**
   * Helper method to find a user by Stripe customer ID
   */
  private async findUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    try {
      const users = await storage.getAllUsers();
      return users.find(user => user.stripeCustomerId === customerId);
    } catch (error) {
      console.error('Error finding user by Stripe customer ID:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();