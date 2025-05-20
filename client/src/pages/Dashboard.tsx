import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import type { Delivery, ContentItem, Activity, Recipient } from "@shared/schema";

// Extended types for UI rendering
interface ExtendedContentItem extends ContentItem {
  sizeInBytes?: number;
}

interface ExtendedDelivery extends Delivery {
  title?: string;
}
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  PlusCircle, 
  Vault, 
  UserIcon, 
  Calendar, 
  Activity as ActivityIcon, 
  FileText, 
  FilesIcon, 
  Image as ImageIcon, 
  Video, 
  MessageSquare, 
  Cog, 
  ChevronRight,
  Shield, 
  Upload,
  Download,
  Edit,
  Trash,
  Check,
  X,
  Lock,
  Unlock,
  ExternalLink,
  FileUp,
  Clock,
  Bell,
  FileQuestion,
  HelpCircle,
  AlarmClock,
  Info,
  AlertTriangle,
  Mail,
  Send,
  Sun,
  Moon,
  HardDrive,
  Files,
  PieChart,
  Users
} from "lucide-react";
import { 
  PieChart as ReChartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip
} from "recharts";

const Dashboard = () => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch vaults count
  const { data: vaults, isLoading: isLoadingVaults } = useQuery({
    queryKey: ["/api/vaults", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/vaults?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch vaults");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  // Fetch recipients count
  const { data: recipients, isLoading: isLoadingRecipients } = useQuery({
    queryKey: ["/api/recipients", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/recipients?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch recipients");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  // Fetch content items
  const { data: contentItems, isLoading: isLoadingContent } = useQuery({
    queryKey: ["/api/content", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/content?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch content items");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  // Fetch deliveries
  const { data: deliveries, isLoading: isLoadingDeliveries } = useQuery({
    queryKey: ["/api/deliveries", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/deliveries?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch deliveries");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  // Fetch recent activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/activities", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/activities?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mt-4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to home
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0 flex items-center">
                  <Avatar className="h-14 w-14 mr-4">
                    <AvatarImage src={currentUser?.avatarUrl || ""} alt={currentUser?.displayName || "User"} />
                    <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 text-lg font-medium">
                      {currentUser?.displayName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Welcome back, {currentUser?.displayName || "User"}
                    </h2>
                    <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <FilesIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        {contentItems?.length || 0} files stored
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Shield className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        {contentItems && contentItems.length > 0 ? 'Encrypted with AES-256' : 'No files yet'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex xl:mt-0 xl:ml-4">
                  <Button
                    onClick={() => navigate("/vaults")}
                    className="inline-flex items-center"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Vault
                  </Button>
                </div>
              </div>
              
              {/* Storage Usage */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage (Free Tier)</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {/* Calculate storage based on content items */}
                    {contentItems?.reduce((acc: number, item: any) => acc + (item.sizeInBytes || 0), 0) / (1024 * 1024) || 0}MB / 200MB
                  </span>
                </div>
                <Progress 
                  value={contentItems?.length ? (contentItems.reduce((acc: number, item: any) => acc + (item.sizeInBytes || 0), 0) / (200 * 1024 * 1024)) * 100 : 0} 
                  className="h-2" 
                />
                {contentItems?.length && (contentItems.reduce((acc: number, item: any) => acc + (item.sizeInBytes || 0), 0) / (200 * 1024 * 1024)) > 0.8 && (
                  <div className="mt-2 text-right">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      Upgrade for more storage
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Dashboard sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* My Vault Section */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FilesIcon className="h-5 w-5 mr-2" />
                  My Vault
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload File
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Create Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <Tabs defaultValue="recent" className="px-6">
                  <TabsList>
                    <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
                    <TabsTrigger value="all">All Files</TabsTrigger>
                  </TabsList>
                  <TabsContent value="recent" className="mt-4">
                    {isLoadingContent ? (
                      <div className="space-y-4">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                      </div>
                    ) : contentItems && contentItems.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contentItems.slice(0, 5).map((item: ContentItem) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium flex items-center">
                                  {item.contentType === 'document' && <FileText className="h-4 w-4 mr-2 text-blue-600" />}
                                  {item.contentType === 'image' && <ImageIcon className="h-4 w-4 mr-2 text-purple-600" />}
                                  {item.contentType === 'video' && <Video className="h-4 w-4 mr-2 text-red-600" />}
                                  {item.contentType === 'message' && <MessageSquare className="h-4 w-4 mr-2 text-green-600" />}
                                  {(!item.contentType || !['document', 'image', 'video', 'message'].includes(item.contentType)) && 
                                    <FileQuestion className="h-4 w-4 mr-2 text-gray-600" />}
                                  {item.title || 'Untitled'}
                                </TableCell>
                                <TableCell>
                                  {item.contentType === 'document' ? 'Document' :
                                   item.contentType === 'image' ? 'Image' :
                                   item.contentType === 'video' ? 'Video' :
                                   item.contentType === 'message' ? 'Message' : 'Other'}
                                </TableCell>
                                <TableCell>
                                  {/* Cast item to any to access sizeInBytes property that might exist in the actual data */}
                                  {(item as any).sizeInBytes ? 
                                    (item as any).sizeInBytes > 1024 * 1024 ? 
                                      `${((item as any).sizeInBytes / (1024 * 1024)).toFixed(1)} MB` : 
                                      `${((item as any).sizeInBytes / 1024).toFixed(1)} KB` : 
                                    'N/A'}
                                </TableCell>
                                <TableCell>
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-1">
                                    <Button variant="ghost" size="icon">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FilesIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">No files uploaded yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Upload documents, photos, videos, or create messages to preserve your legacy.
                        </p>
                        <div className="mt-6">
                          <Button
                            size="sm"
                            onClick={() => navigate("/vaults")}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Your First File
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="all" className="mt-4">
                    <div className="flex justify-center py-10">
                      <Button
                        onClick={() => navigate("/vaults")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View All Files
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              {contentItems && contentItems.length > 5 && (
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" onClick={() => navigate("/vaults")} className="w-full">
                    View All Files
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Content Type Breakdown */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Content Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingContent ? (
                  <div className="h-48 flex items-center justify-center">
                    <Skeleton className="h-40 w-40 rounded-full" />
                  </div>
                ) : contentItems && contentItems.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReChartsPieChart>
                        <Pie
                          data={[
                            { name: 'Documents', value: contentItems.filter((i: ContentItem) => i.contentType === 'document').length || 0, color: '#4f46e5' },
                            { name: 'Photos', value: contentItems.filter((i: ContentItem) => i.contentType === 'image').length || 0, color: '#0891b2' },
                            { name: 'Videos', value: contentItems.filter((i: ContentItem) => i.contentType === 'video').length || 0, color: '#be123c' },
                            { name: 'Messages', value: contentItems.filter((i: ContentItem) => i.contentType === 'message').length || 0, color: '#16a34a' },
                            { name: 'Other', value: contentItems.filter((i: ContentItem) => !['document', 'image', 'video', 'message'].includes(i.contentType)).length || 0, color: '#ca8a04' },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {[
                            { name: 'Documents', value: contentItems.filter((i: ContentItem) => i.contentType === 'document').length || 0, color: '#4f46e5' },
                            { name: 'Photos', value: contentItems.filter((i: ContentItem) => i.contentType === 'image').length || 0, color: '#0891b2' },
                            { name: 'Videos', value: contentItems.filter((i: ContentItem) => i.contentType === 'video').length || 0, color: '#be123c' },
                            { name: 'Messages', value: contentItems.filter((i: ContentItem) => i.contentType === 'message').length || 0, color: '#16a34a' },
                            { name: 'Other', value: contentItems.filter((i: ContentItem) => !['document', 'image', 'video', 'message'].includes(i.contentType)).length || 0, color: '#ca8a04' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </ReChartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center">
                    <FilesIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">No content yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by creating your first content item.
                    </p>
                  </div>
                )}
              </CardContent>
              {contentItems && contentItems.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#4f46e5] mr-1"></div>
                      <span className="text-xs font-medium">{contentItems.filter((i: ContentItem) => i.contentType === 'document').length || 0}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">docs</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#0891b2] mr-1"></div>
                      <span className="text-xs font-medium">{contentItems.filter((i: ContentItem) => i.contentType === 'image').length || 0}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">photos</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#be123c] mr-1"></div>
                      <span className="text-xs font-medium">{contentItems.filter((i: ContentItem) => i.contentType === 'video').length || 0}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">videos</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
          
          {/* Middle Row: Scheduled Releases and Designated Recipients */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Scheduled Releases */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Scheduled Releases
                </CardTitle>
                <Button variant="outline" size="sm" className="h-8" onClick={() => navigate("/schedule")}>
                  <Clock className="h-4 w-4 mr-1" />
                  Schedule New
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingDeliveries ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : deliveries && deliveries.length > 0 ? (
                  <div className="space-y-3">
                    {deliveries.slice(0, 5).map((delivery: Delivery) => (
                      <div key={delivery.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="mr-4">
                          <h3 className="font-medium text-sm">{(delivery as ExtendedDelivery).title || 'Untitled Delivery'}</h3>
                          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {delivery.scheduledDate ? 
                                new Date(delivery.scheduledDate).toLocaleDateString() : 
                                delivery.triggerCondition ? 'On trigger event' : 'No schedule set'}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <UserIcon className="h-3 w-3 mr-1" />
                            <span>
                              {delivery.recipientId && recipients ? 
                                `To: ${recipients.find((r: Recipient) => r.id === delivery.recipientId)?.name || 'Unknown recipient'}` : 
                                'No recipient set'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">No deliveries scheduled</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Schedule content to be delivered at a future date.
                    </p>
                    <div className="mt-6">
                      <Button
                        size="sm"
                        onClick={() => navigate("/schedule")}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Create Schedule
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              {deliveries && deliveries.length > 5 && (
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" onClick={() => navigate("/schedule")} className="w-full">
                    View All Schedules
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Designated Recipients */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Designated Recipients
                </CardTitle>
                <Button variant="outline" size="sm" className="h-8" onClick={() => navigate("/recipients")}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Recipient
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingRecipients ? (
                  <div className="space-y-4">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : recipients && recipients.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipients.slice(0, 5).map((recipient: Recipient) => (
                          <TableRow key={recipient.id}>
                            <TableCell className="font-medium">{recipient.name}</TableCell>
                            <TableCell>{recipient.email}</TableCell>
                            <TableCell>
                              {recipient.isVerified ? (
                                <Badge variant="success" className="flex items-center w-fit">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="warning" className="flex items-center w-fit">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <UserIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">No recipients added</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Add people who will receive your content.
                    </p>
                    <div className="mt-6">
                      <Button
                        size="sm"
                        onClick={() => navigate("/recipients")}
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        Add First Recipient
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              {recipients && recipients.length > 5 && (
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" onClick={() => navigate("/recipients")} className="w-full">
                    Manage All Recipients
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
          
          {/* Bottom Row: Premium Features and Security/Support */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Premium Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Premium Features</CardTitle>
                <CardDescription>Unlock advanced capabilities with EchoVault Premium</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-md overflow-hidden">
                  <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center p-6">
                      <Lock className="h-8 w-8 text-white mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-white mb-2">Upgrade to Premium</h3>
                      <p className="text-sm text-white/90 mb-4">Unlock Auto-Release, PDF Export, and 200MB+ Storage</p>
                      <Button className="bg-white text-gray-900 hover:bg-gray-100">
                        Go Premium
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 filter blur-sm">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium">Auto-Release Monitoring</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Automated check-ins and intelligent release system
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium">PDF Export & Backup</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Create printable documents with all your vault contents
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <HardDrive className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium">Expanded Storage</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Up to 10GB of secure encrypted storage for all your memories
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Security Center */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                        <Lock className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Add extra security to your account
                        </p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                        <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Download Vault Backup</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Save an encrypted copy of your data
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-medium mb-2">Recent Login Activity</h3>
                    <div className="space-y-2">
                      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md flex justify-between items-center text-xs">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 mr-2">
                            <Check className="h-3 w-3" />
                          </div>
                          <span>123.45.67.89</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">Just Now</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md flex justify-between items-center text-xs">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 mr-2">
                            <Check className="h-3 w-3" />
                          </div>
                          <span>123.45.67.89</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">Yesterday</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex justify-between">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Support / FAQ */}
          <div className="mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Support & FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-primary-600" />
                      What happens when I die?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      EchoVault uses trusted contacts and inactivity tracking to detect when content should be released.
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                      Learn more
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary-600" />
                      How do I share with family?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add recipients and select content to share on specific dates or upon certain conditions.
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                      Learn more
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary-600" />
                      Legal Declaration Overview
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Learn how EchoVault integrates with your will and estate planning documents.
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                      Learn more
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-primary-600" />
                      Contact Support
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our support team is available to help with any questions or concerns.
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                      Contact us
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Premium Features Section */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Premium Features
                </CardTitle>
                <CardDescription>
                  Enhance your EchoVault experience with premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Basic</CardTitle>
                      <CardDescription>Free</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>10 GB Storage</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>5 Recipients</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>Basic Encryption</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>Email Delivery</span>
                        </li>
                        <li className="flex items-center opacity-50">
                          <X className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Advanced Features</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Badge>Current Plan</Badge>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-2 border-primary relative">
                    <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs py-1 px-3 rounded-full">
                      Popular
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Premium</CardTitle>
                      <CardDescription className="flex items-baseline">
                        <span className="text-lg font-semibold">$19.99</span>
                        <span className="ml-1 text-xs text-muted-foreground">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>50 GB Storage</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>Unlimited Recipients</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>Advanced Encryption</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>Email & SMS Delivery</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>Priority Support</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate("/subscribe")}
                      >
                        Upgrade Now
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-2 border-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Enterprise</CardTitle>
                      <CardDescription className="flex items-baseline">
                        <span className="text-lg font-semibold">$49.99</span>
                        <span className="ml-1 text-xs text-muted-foreground">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>500 GB Storage</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>Unlimited Recipients</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>Military-grade Encryption</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>All Delivery Methods</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>AI Voice Letters</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate("/subscribe")}
                      >
                        Upgrade to Enterprise
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;