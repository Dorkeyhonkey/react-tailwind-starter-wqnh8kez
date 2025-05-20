import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";

// Load Stripe public key directly from environment or .env file
// We set this in a way that works even if the environment variables aren't properly loaded
// This is just a fallback mechanism
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 
  'pk_test_51RLV3x2SmJRUbkBK0cM7BkM2cZM1QJIVWqnURQLiVFqoxwXn90QgfkPpzQEQL00CG9liF4WTDJU2CDvHo2e2OMNl0015ekeMgk';
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

// The actual checkout form component wrapped with Stripe context
const CheckoutForm = ({ amount, onSuccess }: { amount: number, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
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
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment processing.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: err instanceof Error ? err.message : "An error occurred during payment processing.",
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
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

// The checkout page container component
const Checkout = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount] = useState(1999); // $19.99 in cents
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('POST', '/api/payments/create-payment-intent', { 
          amount: amount / 100, // Convert to dollars for the API
          currency: 'usd',
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.message || 'Failed to create payment intent');
          toast({
            title: "Payment Setup Failed",
            description: data.message || 'Failed to create payment intent',
            variant: "destructive",
          });
        }
      } catch (err) {
        setError('An error occurred while setting up the payment');
        toast({
          title: "Payment Setup Error",
          description: err instanceof Error ? err.message : 'An error occurred while setting up the payment',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!paymentComplete) {
      createPaymentIntent();
    }
  }, [amount, toast, paymentComplete]);

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
  };

  if (!stripePromise) {
    return (
      <div className="container max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Not Available</CardTitle>
            <CardDescription>
              Payment processing is currently unavailable. Please try again later or contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The payment system is not properly configured. This is usually due to missing Stripe API keys.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="container max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your account has been upgraded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your payment has been processed successfully. Your premium features are now active.</p>
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

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            Secure payment processing via Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Preparing payment form...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
              <p className="mt-2">Please try again later or contact support.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="flex justify-between">
                  <span>EchoVault Premium (1 month)</span>
                  <span>${(amount / 100).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(amount / 100).toFixed(2)}</span>
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
                  <CheckoutForm amount={amount} onSuccess={handlePaymentSuccess} />
                </Elements>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;