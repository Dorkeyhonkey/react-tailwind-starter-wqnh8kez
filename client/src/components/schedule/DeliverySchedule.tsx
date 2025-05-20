import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Delivery, ContentItem, Recipient } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleDeliveryModal } from "./ScheduleDeliveryModal";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, FileText, Image, Video, Mail, File, User, MoreHorizontal, Edit, Trash, Bell, AlertTriangle } from "lucide-react";

interface DeliveryScheduleProps {
  onScheduleDelivery: () => void;
}

const DeliverySchedule = ({ onScheduleDelivery }: DeliveryScheduleProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

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

  // Fetch content items and recipients for display
  const { data: contentItems } = useQuery({
    queryKey: ["/api/content", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/content?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch content items");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  const { data: recipients } = useQuery({
    queryKey: ["/api/recipients", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/recipients?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch recipients");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  const getContentItemById = (id: number): ContentItem | undefined => {
    return contentItems?.find((item: ContentItem) => item.id === id);
  };

  const getRecipientById = (id: number): Recipient | undefined => {
    return recipients?.find((recipient: Recipient) => recipient.id === id);
  };

  const getIconForContentType = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'document':
        return <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'message':
        return <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />;
      default:
        return <File className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const handleEditDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsScheduleModalOpen(true);
  };

  const handleDeleteDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDelivery = async () => {
    if (!selectedDelivery) return;
    
    try {
      await apiRequest("DELETE", `/api/deliveries/${selectedDelivery.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Success",
        description: "Delivery canceled successfully",
      });
    } catch (error) {
      console.error("Error canceling delivery:", error);
      toast({
        title: "Error",
        description: "Failed to cancel delivery",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDelivery(null);
    }
  };

  // Group deliveries by year
  const groupDeliveriesByYear = () => {
    if (!deliveries) return {};
    
    return deliveries.reduce((acc: Record<string, Delivery[]>, delivery: Delivery) => {
      if (!delivery.scheduledDate && !delivery.triggerCondition) return acc;
      
      const year = delivery.scheduledDate 
        ? new Date(delivery.scheduledDate).getFullYear().toString()
        : "Conditional";
      
      if (!acc[year]) {
        acc[year] = [];
      }
      
      acc[year].push(delivery);
      return acc;
    }, {});
  };

  const groupedDeliveries = groupDeliveriesByYear();

  if (isLoadingDeliveries) {
    return (
      <div className="space-y-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="mb-4">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-6">
              {Array(2).fill(0).map((_, j) => (
                <div key={j} className="flex items-start">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="ml-4 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Calendar className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No scheduled deliveries</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Schedule content to be delivered to your recipients in the future
        </p>
        <Button className="mt-4" onClick={onScheduleDelivery}>
          Schedule Delivery
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.keys(groupedDeliveries).length > 0 ? (
        Object.entries(groupedDeliveries).map(([year, yearDeliveries]) => (
          <div key={year}>
            <h3 className="text-md font-medium text-gray-500 dark:text-gray-400 mb-4">{year}</h3>
            <Card>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {yearDeliveries.map((delivery: Delivery) => {
                  const contentItem = getContentItemById(delivery.contentItemId);
                  const recipient = getRecipientById(delivery.recipientId);
                  
                  return (
                    <div key={delivery.id} className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="sm:flex items-center">
                          <div className="flex items-center">
                            {delivery.scheduledDate ? (
                              <Calendar className="flex-shrink-0 h-8 w-8 text-primary-600 dark:text-primary-400" />
                            ) : (
                              <Bell className="flex-shrink-0 h-8 w-8 text-amber-600 dark:text-amber-400" />
                            )}
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {delivery.scheduledDate 
                                  ? format(new Date(delivery.scheduledDate), "MMMM d, yyyy")
                                  : "Conditional Trigger"
                                }
                              </p>
                              {delivery.triggerCondition && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Trigger: {delivery.triggerCondition}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          <Badge
                            variant={delivery.isDelivered ? "default" : delivery.scheduledDate ? "outline" : "secondary"}
                          >
                            {delivery.isDelivered ? "Delivered" : "Pending"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="ml-2">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditDelivery(delivery)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteDelivery(delivery)}>
                                <Trash className="h-4 w-4 mr-2" />
                                Cancel Delivery
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between">
                        <div className="flex items-center mt-2 sm:mt-0">
                          {contentItem && (
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                {getIconForContentType(contentItem.contentType)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {contentItem.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {contentItem.contentType.charAt(0).toUpperCase() + contentItem.contentType.slice(1)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-2 sm:mt-0">
                          {recipient && (
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  To: {recipient.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {recipient.email}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No scheduled deliveries found.</p>
        </div>
      )}
      
      <ScheduleDeliveryModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        deliveryToEdit={selectedDelivery}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Delivery</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this scheduled delivery? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Delivery</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDelivery} className="bg-red-600 hover:bg-red-700">
              Cancel Delivery
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeliverySchedule;
