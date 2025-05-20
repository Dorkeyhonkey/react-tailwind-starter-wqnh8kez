import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DeliverySchedule from "@/components/schedule/DeliverySchedule";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Schedule = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to home
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Delivery Schedule</h1>
            <Button
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Delivery
            </Button>
          </div>
          
          <DeliverySchedule onScheduleDelivery={() => setIsScheduleModalOpen(true)} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Schedule;
