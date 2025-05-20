import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useLocation, Link } from 'wouter';

const PaymentSuccess = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Parse URL search params manually
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');
  
  useEffect(() => {
    // Simulate checking the payment status
    const verifyPayment = async () => {
      try {
        // In a real implementation, you might want to verify the payment with your server
        // const response = await apiRequest('GET', `/api/payments/verify?payment_intent=${paymentIntent}`);
        
        // For now, we'll just check if we have the right redirect status
        if (redirectStatus === 'succeeded') {
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully!',
          });
        } else {
          toast({
            title: 'Payment Status',
            description: `Payment status: ${redirectStatus || 'unknown'}`,
            variant: redirectStatus === 'succeeded' ? 'default' : 'destructive',
          });
        }
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to verify payment status.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (paymentIntent && paymentIntentClientSecret) {
      verifyPayment();
    } else {
      // If we don't have payment intent parameters, this may not be a proper redirect
      setIsLoading(false);
    }
  }, [paymentIntent, paymentIntentClientSecret, redirectStatus, toast]);

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
        <p className="text-muted-foreground text-center">
          Please wait while we verify your payment...
        </p>
      </div>
    );
  }
  
  if (!paymentIntent || !paymentIntentClientSecret) {
    return (
      <div className="container max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Payment Redirect</CardTitle>
            <CardDescription>
              We couldn't find the payment information in the URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This could happen if you accessed this page directly instead of being redirected 
              from the payment processor.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-md mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          {redirectStatus === 'succeeded' ? (
            <>
              <div className="flex justify-center mb-2">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle>Payment Successful!</CardTitle>
              <CardDescription>
                Your payment has been processed successfully.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle>Payment {redirectStatus || 'Processed'}</CardTitle>
              <CardDescription>
                Your payment has been {redirectStatus || 'processed'}.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-center text-muted-foreground">
              {redirectStatus === 'succeeded' 
                ? 'Thank you for your purchase. Your premium features are now available.' 
                : 'Your payment status has been recorded.'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;