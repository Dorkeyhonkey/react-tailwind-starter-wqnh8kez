import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Vaults from "@/pages/Vaults";
import Recipients from "@/pages/Recipients";
import Schedule from "@/pages/Schedule";
import Profile from "@/pages/Profile";
import Checkout from "@/pages/Checkout";
import Subscribe from "@/pages/Subscribe";
import PaymentSuccess from "@/pages/PaymentSuccess";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        <Route path="/" component={Home} />
        
        {/* Protected Routes */}
        {isAuthenticated && (
          <>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/vaults" component={Vaults} />
            <Route path="/recipients" component={Recipients} />
            <Route path="/schedule" component={Schedule} />
            <Route path="/profile" component={Profile} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/subscribe" component={Subscribe} />
            <Route path="/payment-success" component={PaymentSuccess} />
            <Route path="/subscription-success" component={SubscriptionSuccess} />
          </>
        )}
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
