import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Recipient } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import AddRecipientModal from "./AddRecipientModal";
import { Mail, Phone, Shield, CheckCircle, AlertTriangle, User, MoreHorizontal, Edit, Trash } from "lucide-react";

interface RecipientListProps {
  onAddRecipient: () => void;
}

const RecipientList = ({ onAddRecipient }: RecipientListProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  // Fetch recipients
  const { data: recipients, isLoading, error } = useQuery({
    queryKey: ["/api/recipients", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/recipients?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch recipients");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  const handleEditRecipient = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setIsEditModalOpen(true);
  };

  const handleDeleteRecipient = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRecipient = async () => {
    if (!selectedRecipient) return;
    
    try {
      await apiRequest("DELETE", `/api/recipients/${selectedRecipient.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      toast({
        title: "Success",
        description: "Recipient deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting recipient:", error);
      toast({
        title: "Error",
        description: "Failed to delete recipient",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRecipient(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Failed to load recipients</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Please try again later</p>
        <Button className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/recipients"] })}>
          Retry
        </Button>
      </div>
    );
  }

  if (!recipients || recipients.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <User className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No recipients found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add recipients to send your legacy content to
        </p>
        <Button className="mt-4" onClick={onAddRecipient}>
          Add Recipient
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recipients.map((recipient: Recipient) => (
        <Card key={recipient.id} className="overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
                  {recipient.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{recipient.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{recipient.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={recipient.isVerified ? "success" : "warning"}>
                  {recipient.isVerified ? "Verified" : "Pending"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Recipient Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditRecipient(recipient)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Recipient
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteRecipient(recipient)}>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Recipient
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mt-4 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  Email notification
                </p>
                {recipient.phone && (
                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6 dark:text-gray-400">
                    <Phone className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    SMS backup
                  </p>
                )}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
                {recipient.isVerified ? (
                  <>
                    <CheckCircle className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" />
                    Identity verified
                  </>
                ) : (
                  <>
                    <AlertTriangle className="flex-shrink-0 mr-1.5 h-5 w-5 text-yellow-500" />
                    Verification pending
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      <AddRecipientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        recipientToEdit={selectedRecipient}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRecipient?.name}? This will also remove any scheduled deliveries for this recipient.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRecipient} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecipientList;
