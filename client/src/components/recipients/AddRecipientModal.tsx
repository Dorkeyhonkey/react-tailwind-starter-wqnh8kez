import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { InsertRecipient, Recipient } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface AddRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientToEdit?: Recipient | null;
}

const AddRecipientModal = ({ isOpen, onClose, recipientToEdit }: AddRecipientModalProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  const isEditMode = !!recipientToEdit;

  useEffect(() => {
    if (recipientToEdit) {
      setName(recipientToEdit.name);
      setEmail(recipientToEdit.email);
      setPhone(recipientToEdit.phone || "");
      
      // Set notification preferences if available
      if (recipientToEdit.notificationPreferences) {
        const prefs = recipientToEdit.notificationPreferences as any;
        setEmailNotifications(prefs.email || true);
        setSmsNotifications(prefs.sms || false);
      }
      
      // Don't send welcome email when editing
      setSendWelcomeEmail(false);
    } else {
      resetForm();
    }
  }, [recipientToEdit, isOpen]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setEmailNotifications(true);
    setSmsNotifications(false);
    setSendWelcomeEmail(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Please provide a name and email",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add a recipient",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const recipientData: InsertRecipient = {
        name,
        email,
        phone: phone || undefined,
        userId: currentUser.id,
        isVerified: false, // New recipients start as unverified
        notificationPreferences: {
          email: emailNotifications,
          sms: smsNotifications,
          sendWelcomeEmail,
        }
      };

      if (isEditMode && recipientToEdit?.id) {
        await apiRequest("PUT", `/api/recipients/${recipientToEdit.id}`, recipientData);
        toast({
          title: "Success",
          description: "Recipient updated successfully",
        });
      } else {
        await apiRequest("POST", "/api/recipients", recipientData);
        toast({
          title: "Success",
          description: "Recipient added successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error adding/updating recipient:", error);
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update recipient" : "Failed to add recipient",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Recipient" : "Add Recipient"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update details for this recipient"
              : "Add someone who should receive your content"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                className="col-span-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                className="col-span-3"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Notifications
              </Label>
              <div className="col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="text-sm font-normal cursor-pointer">
                    Email notifications
                  </Label>
                  <Switch 
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications" className="text-sm font-normal cursor-pointer">
                    SMS notifications
                  </Label>
                  <Switch 
                    id="sms-notifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
              </div>
            </div>
            
            {!isEditMode && (
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="col-start-2 col-span-3 flex items-start space-x-2">
                  <Checkbox
                    id="welcome-email"
                    checked={sendWelcomeEmail}
                    onCheckedChange={(checked) => 
                      setSendWelcomeEmail(checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="welcome-email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Send welcome email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Send an introduction email explaining the purpose of EchoVault
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Adding..."}
                </>
              ) : (
                isEditMode ? "Save Changes" : "Add Recipient"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecipientModal;
