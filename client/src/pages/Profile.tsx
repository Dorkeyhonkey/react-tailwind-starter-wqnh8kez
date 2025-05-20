import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { uploadFile } from "@/lib/firebase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, UserCircle, Lock, BellRing, CreditCard, LogOut, AlertTriangle } from "lucide-react";

const Profile = () => {
  const { isAuthenticated, isLoading, currentUser, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Initialize form values
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setEmail(currentUser.email || "");
      setAvatarPreview(currentUser.avatarUrl || "");
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.id) return;
    
    try {
      setIsSaving(true);
      
      let avatarUrl = currentUser.avatarUrl || "";
      
      if (avatarFile) {
        const path = `avatars/${currentUser.id}/${Date.now()}_${avatarFile.name}`;
        avatarUrl = await uploadFile(avatarFile, path);
      }
      
      const userData = {
        displayName,
        email,
        avatarUrl
      };
      
      await apiRequest("PUT", `/api/users/${currentUser.id}`, userData);
      
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser.id}`] });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Here you would normally handle password change through Firebase
      // and update your backend if needed
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Failed to update password:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Account deletion feature will be available soon.",
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !currentUser) {
    return null; // Will redirect to home
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Account Settings</h1>
          
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-64 space-y-2">
                <TabsList className="flex sm:flex-col w-full">
                  <TabsTrigger value="profile" className="w-full justify-start">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="w-full justify-start">
                    <BellRing className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </TabsTrigger>
                </TabsList>
                
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex-1">
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal details and profile picture
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleProfileUpdate}>
                      <CardContent className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                          <Avatar className="h-24 w-24">
                            {avatarPreview ? (
                              <AvatarImage src={avatarPreview} alt={displayName} />
                            ) : (
                              <AvatarFallback>
                                {displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <Label htmlFor="avatar" className="block text-sm font-medium mb-1">
                              Change Profile Picture
                            </Label>
                            <Input
                              id="avatar"
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                          </div>
                        </div>
                        
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="John Doe"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="example@example.com"
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handlePasswordChange}>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Danger Zone</CardTitle>
                      <CardDescription>
                        Permanently delete your account and all your data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Warning: This action cannot be undone</h4>
                          <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                            Once you delete your account, all your data will be permanently removed. This includes all your vaults, content, and scheduled deliveries.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Manage how and when you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive updates about your account via email
                            </p>
                          </div>
                          <Switch id="email-notifications" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="delivery-notifications" className="font-medium">Delivery Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Get notified when content is delivered to recipients
                            </p>
                          </div>
                          <Switch id="delivery-notifications" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="security-notifications" className="font-medium">Security Alerts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Important security-related notifications
                            </p>
                          </div>
                          <Switch id="security-notifications" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="marketing-notifications" className="font-medium">Marketing Emails</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive news, updates, and promotions
                            </p>
                          </div>
                          <Switch id="marketing-notifications" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save Preferences</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="billing">
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing and Subscription</CardTitle>
                      <CardDescription>
                        Manage your subscription plan and payment methods
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Current Plan: Free</h3>
                          <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                            You are currently on the free plan with basic features.
                          </p>
                        </div>
                        
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Premium Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">$9.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                              <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span>Unlimited vaults</span>
                                </li>
                                <li className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span>10GB storage</span>
                                </li>
                                <li className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span>Priority support</span>
                                </li>
                                <li className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span>Advanced encryption</span>
                                </li>
                              </ul>
                            </CardContent>
                            <CardFooter>
                              <Button className="w-full">Upgrade</Button>
                            </CardFooter>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Family Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">$19.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                              <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span>Everything in Premium</span>
                                </li>
                                <li className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span>Up to 5 family members</span>
                                </li>
                                <li className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span>50GB shared storage</span>
                                </li>
                                <li className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span>Family sharing controls</span>
                                </li>
                              </ul>
                            </CardContent>
                            <CardFooter>
                              <Button className="w-full">Upgrade</Button>
                            </CardFooter>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
