import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Delivery, InsertDelivery, ContentItem, Recipient } from "@shared/schema";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Loader2, Calendar as CalendarIcon, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduleDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryToEdit?: Delivery | null;
}

export const ScheduleDeliveryModal = ({ isOpen, onClose, deliveryToEdit }: ScheduleDeliveryModalProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [recipientId, setRecipientId] = useState<string>("");
  const [contentItemId, setContentItemId] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("email");
  const [useConditionalTrigger, setUseConditionalTrigger] = useState(false);
  const [triggerCondition, setTriggerCondition] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("date");
  
  const isEditMode = !!deliveryToEdit;

  // Fetch recipients
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

  // Fetch content items
  const { data: contentItems } = useQuery({
    queryKey: ["/api/content", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/content?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  useEffect(() => {
    if (deliveryToEdit) {
      // Set form values if editing
      if (deliveryToEdit.scheduledDate) {
        setScheduledDate(new Date(deliveryToEdit.scheduledDate));
        setActiveTab("date");
      } else if (deliveryToEdit.triggerCondition) {
        setUseConditionalTrigger(true);
        setTriggerCondition(deliveryToEdit.triggerCondition);
        setActiveTab("conditional");
      }
      
      setRecipientId(deliveryToEdit.recipientId.toString());
      setContentItemId(deliveryToEdit.contentItemId.toString());
      setDeliveryMethod(deliveryToEdit.deliveryMethod || "email");
      setAdditionalNotes(deliveryToEdit.additionalNotes || "");
    } else {
      resetForm();
    }
  }, [deliveryToEdit, isOpen]);

  const resetForm = () => {
    setScheduledDate(undefined);
    setRecipientId("");
    setContentItemId("");
    setDeliveryMethod("email");
    setUseConditionalTrigger(false);
    setTriggerCondition("");
    setAdditionalNotes("");
    setActiveTab("date");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientId || !contentItemId) {
      toast({
        title: "Error",
        description: "Please select a recipient and content item",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "date" && !scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a delivery date",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "conditional" && !triggerCondition) {
      toast({
        title: "Error",
        description: "Please specify a trigger condition",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to schedule a delivery",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const deliveryData: InsertDelivery = {
        userId: currentUser.id,
        recipientId: parseInt(recipientId),
        contentItemId: parseInt(contentItemId),
        scheduledDate: activeTab === "date" ? scheduledDate : undefined,
        triggerCondition: activeTab === "conditional" ? triggerCondition : undefined,
        deliveryMethod,
        additionalNotes,
        isDelivered: false,
        deliveredAt: null,
      };

      if (isEditMode && deliveryToEdit?.id) {
        await apiRequest("PUT", `/api/deliveries/${deliveryToEdit.id}`, deliveryData);
        toast({
          title: "Success",
          description: "Delivery schedule updated successfully",
        });
      } else {
        await apiRequest("POST", "/api/deliveries", deliveryData);
        toast({
          title: "Success",
          description: "Delivery scheduled successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error scheduling delivery:", error);
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update delivery schedule" : "Failed to schedule delivery",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "date") {
      setTriggerCondition("");
    } else {
      setScheduledDate(undefined);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Scheduled Delivery" : "Schedule Content Delivery"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update when and how your content will be delivered"
              : "Choose when, to whom, and how your content will be delivered"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                Recipient
              </Label>
              <div className="col-span-3">
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients?.map((recipient: Recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id.toString()}>
                        {recipient.name} ({recipient.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <div className="col-span-3">
                <Select value={contentItemId} onValueChange={setContentItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentItems?.map((item: ContentItem) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.title} ({item.contentType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delivery-method" className="text-right">
                Method
              </Label>
              <div className="col-span-3">
                <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="both">Email & SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">
                When
              </Label>
              <div className="col-span-3">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="date">Specific Date</TabsTrigger>
                    <TabsTrigger value="conditional">Conditional</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="date" className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium">
                        Delivery Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledDate ? format(scheduledDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            disabled={(date) => 
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="conditional" className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="trigger-condition" className="text-sm font-medium">
                          Trigger Condition
                        </Label>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Info className="h-3 w-3 mr-1" />
                          Delivered upon specified event
                        </div>
                      </div>
                      <Select value={triggerCondition} onValueChange={setTriggerCondition}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="death">Upon Death (Death Certificate Verification)</SelectItem>
                          <SelectItem value="inactivity">Extended Account Inactivity (90+ days)</SelectItem>
                          <SelectItem value="manual">Manual Confirmation Required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add delivery instructions or a personal note"
                className="col-span-3"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Scheduling..."}
                </>
              ) : (
                isEditMode ? "Update Schedule" : "Schedule Delivery"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};