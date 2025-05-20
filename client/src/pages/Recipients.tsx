import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RecipientList from "@/components/recipients/RecipientList";
import AddRecipientModal from "@/components/recipients/AddRecipientModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusCircle } from "lucide-react";

const Recipients = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Recipients</h1>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Recipient
            </Button>
          </div>
          
          <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="list">Recipients List</TabsTrigger>
              <TabsTrigger value="settings">Delivery Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <RecipientList onAddRecipient={() => setIsAddModalOpen(true)} />
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Methods</CardTitle>
                  <CardDescription>
                    Configure how your recipients will be notified when content is ready for them.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="email_notifications" defaultChecked />
                      <div>
                        <Label htmlFor="email_notifications" className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Send an email when content is available for viewing.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sms_notifications" />
                      <div>
                        <Label htmlFor="sms_notifications" className="font-medium">SMS Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Send a text message when content is available for viewing.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="reminder_notifications" defaultChecked />
                      <div>
                        <Label htmlFor="reminder_notifications" className="font-medium">Reminder Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Send reminders if content hasn't been viewed after 7 days.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Verification Requirements</h3>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      Configure the identity verification level required for recipients.
                    </p>
                    
                    <div className="w-full max-w-sm">
                      <Select defaultValue="government">
                        <SelectTrigger>
                          <SelectValue placeholder="Select verification level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email verification only</SelectItem>
                          <SelectItem value="phone">Email + Phone verification</SelectItem>
                          <SelectItem value="government">Government ID verification</SelectItem>
                          <SelectItem value="enhanced">Enhanced verification (ID + Video)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Default Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-expire" className="font-medium">Auto-expire access</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Automatically expire recipient access after 30 days
                          </p>
                        </div>
                        <Switch id="auto-expire" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="download-allowed" className="font-medium">Allow downloads</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Allow recipients to download content
                          </p>
                        </div>
                        <Switch id="download-allowed" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AddRecipientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      <Footer />
    </div>
  );
};

export default Recipients;
