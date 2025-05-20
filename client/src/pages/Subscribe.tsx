import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";

// Load Stripe public key directly from environment or .env file
// Using the same fallback mechanism as in Checkout.tsx
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 
  'pk_test_51RLV3x2SmJRUbkBK0cM7BkM2cZM1QJIVWqnURQLiVFqoxwXn90QgfkPpzQEQL00CG9liF4WTDJU2CDvHo2e2OMNl0015ekeMgk';
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

// Define subscription tiers
const subscriptionTiers = {
  basic: {
    name: 'Basic',
    price: 9.99,
    features: [
      '10 GB storage space',
      '5 recipients',
      'Basic encryption',
      'Email delivery',
    ],
  },
  premium: {
    name: 'Premium',
    price: 19.99,
    features: [
      '50 GB storage space',
      'Unlimited recipients',
      'Advanced encryption',
      'Email & SMS delivery',
      'Priority support',
      'Scheduled deliveries',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 49.99,
    features: [
      '500 GB storage space',
      'Unlimited recipients',
      'Military-grade encryption',
      'All delivery methods',
      'Dedicated support line',
      'AI voice letters',
      'Custom branding options',
    ],
  },
};

// The subscription form component wrapped with Stripe context
const SubscriptionForm = ({ tierName, onSuccess }: { tierName: string, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Subscription Error",
        description: "Stripe is not initialized properly.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Subscription Failed",
          description: error.message || "An error occurred during subscription processing.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription Successful",
          description: "Your subscription has been activated!",
        });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Subscription Error",
        description: err instanceof Error ? err.message : "An error occurred during subscription processing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Subscribe to ${subscriptionTiers[tierName as keyof typeof subscriptionTiers].name} Plan`
        )}
      </Button>
    </form>
  );
};

// The subscription page container component
const Subscribe = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('premium');
  const [subscriptionComplete, setSubscriptionComplete] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isSubscribed: boolean;
    tier?: string;
    status?: string;
    expiresAt?: string | null;
  } | null>(null);
  const { toast } = useToast();

  // Fetch current subscription status
  useEffect(() => {
    const getSubscriptionStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/subscriptions/status');
        
        if (response.ok) {
          const data = await response.json();
          setSubscriptionStatus({
            isSubscribed: data.subscriptionStatus && data.subscriptionStatus !== 'canceled',
            tier: data.subscriptionTier,
            status: data.subscriptionStatus,
            expiresAt: data.subscriptionExpiresAt,
          });
        }
      } catch (err) {
        console.error('Failed to fetch subscription status:', err);
      }
    };

    getSubscriptionStatus();
  }, []);

  // Create subscription when tier changes
  useEffect(() => {
    const createSubscription = async () => {
      if (subscriptionStatus?.isSubscribed) {
        return; // Don't create a new subscription if already subscribed
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await apiRequest('POST', '/api/subscriptions/create', { 
          tierName: selectedTier,
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.message || 'Failed to create subscription');
          toast({
            title: "Subscription Setup Failed",
            description: data.message || 'Failed to create subscription',
            variant: "destructive",
          });
        }
      } catch (err) {
        setError('An error occurred while setting up the subscription');
        toast({
          title: "Subscription Setup Error",
          description: err instanceof Error ? err.message : 'An error occurred while setting up the subscription',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!subscriptionComplete && selectedTier) {
      createSubscription();
    }
  }, [selectedTier, subscriptionComplete, toast, subscriptionStatus]);

  const handleSubscriptionSuccess = () => {
    setSubscriptionComplete(true);
  };

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/subscriptions/cancel');
      
      if (response.ok) {
        toast({
          title: "Subscription Canceled",
          description: "Your subscription has been canceled. You'll have access until the end of the current billing period.",
        });
        
        // Update subscription status
        setSubscriptionStatus({
          ...subscriptionStatus!,
          status: 'canceled'
        });
      } else {
        const data = await response.json();
        toast({
          title: "Failed to Cancel",
          description: data.message || "Failed to cancel your subscription. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred while canceling your subscription.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!stripePromise) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Not Available</CardTitle>
            <CardDescription>
              Subscription processing is currently unavailable. Please try again later or contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The subscription system is not properly configured. This is usually due to missing Stripe API keys.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (subscriptionComplete) {
    return (
      <div className="container max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Successful!</CardTitle>
            <CardDescription>
              Thank you for subscribing to EchoVault {subscriptionTiers[selectedTier as keyof typeof subscriptionTiers].name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your subscription has been processed successfully. Your premium features are now active.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show current subscription status if subscribed
  if (subscriptionStatus?.isSubscribed) {
    const currentTier = subscriptionStatus.tier || 'free';
    const formattedTier = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
    const isActive = subscriptionStatus.status !== 'canceled';
    
    return (
      <div className="container max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Subscription</CardTitle>
                <CardDescription>
                  Manage your current subscription
                </CardDescription>
              </div>
              <Badge variant={isActive ? "default" : "destructive"}>
                {isActive ? "Active" : "Canceled"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Subscription Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Plan</span>
                  <span className="font-medium">{formattedTier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-medium">{subscriptionStatus.status}</span>
                </div>
                {subscriptionStatus.expiresAt && (
                  <div className="flex justify-between">
                    <span>Valid Until</span>
                    <span className="font-medium">
                      {new Date(subscriptionStatus.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {isActive && (
              <>
                <p className="text-muted-foreground mb-4">
                  You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              </>
            )}
            
            {!isActive && (
              <div className="text-center py-4">
                <p className="mb-4">Your subscription has been canceled and will expire at the end of the current billing period.</p>
                <Button onClick={() => window.location.reload()}>
                  Resubscribe
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">Select the subscription tier that fits your needs</p>
      </div>
      
      <Tabs 
        defaultValue={selectedTier} 
        value={selectedTier}
        onValueChange={setSelectedTier}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
        </TabsList>
        
        {Object.entries(subscriptionTiers).map(([tierKey, tierData]) => (
          <TabsContent key={tierKey} value={tierKey} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{tierData.name} Tier</CardTitle>
                <CardDescription>
                  ${tierData.price.toFixed(2)}/month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-medium">Features included:</h3>
                  <ul className="space-y-2">
                    {tierData.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Complete Your Subscription</CardTitle>
                <CardDescription>
                  Secure subscription processing via Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Preparing subscription form...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-destructive">
                    <p>{error}</p>
                    <p className="mt-2">Please try again later or contact support.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-2">Subscription Summary</h3>
                      <div className="flex justify-between">
                        <span>EchoVault {tierData.name}</span>
                        <span>${tierData.price.toFixed(2)}/month</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Monthly Total</span>
                        <span>${tierData.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {clientSecret && (
                      <Elements 
                        stripe={stripePromise} 
                        options={{ 
                          clientSecret,
                          appearance: {
                            theme: 'stripe',
                            variables: {
                              colorPrimary: '#0f172a',
                            }
                          }
                        }}
                      >
                        <SubscriptionForm tierName={tierKey} onSuccess={handleSubscriptionSuccess} />
                      </Elements>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Subscribe;