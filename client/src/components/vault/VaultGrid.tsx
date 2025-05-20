import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Vault } from "@shared/schema";
import VaultCard from "./VaultCard";
import CreateVaultModal from "./CreateVaultModal";
import CreateContentModal from "./CreateContentModal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";

const VaultGrid = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateVaultOpen, setIsCreateVaultOpen] = useState(false);
  const [isCreateContentOpen, setIsCreateContentOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);

  // Fetch vaults
  const { data: vaults, isLoading, error } = useQuery({
    queryKey: ["/api/vaults", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/vaults?userId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch vaults");
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  // Mock content and recipient counts - in a real app, these would be fetched from the API
  const getContentCount = (vaultId: number) => {
    return Math.floor(Math.random() * 10) + 1; // Replace with actual API call
  };

  const getRecipientCount = (vaultId: number) => {
    return Math.floor(Math.random() * 5) + 1; // Replace with actual API call
  };

  const getNextDeliveryDate = (vaultId: number) => {
    // Generate a random date in the future (1-365 days)
    const daysToAdd = Math.floor(Math.random() * 365) + 1;
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date; // Replace with actual API call
  };

  const handleCreateVault = () => {
    setSelectedVault(null);
    setIsCreateVaultOpen(true);
  };

  const handleEditVault = (vault: Vault) => {
    setSelectedVault(vault);
    setIsCreateVaultOpen(true);
  };

  const handleDeleteVault = (vault: Vault) => {
    setSelectedVault(vault);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteVault = async () => {
    if (!selectedVault) return;
    
    try {
      await apiRequest("DELETE", `/api/vaults/${selectedVault.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/vaults"] });
      toast({
        title: "Success",
        description: "Vault deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting vault:", error);
      toast({
        title: "Error",
        description: "Failed to delete vault",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedVault(null);
    }
  };

  const handleAddContent = (vaultId: number) => {
    setSelectedVaultId(vaultId);
    setIsCreateContentOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-5 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700">
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Failed to load vaults</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Please try again later</p>
        <Button className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/vaults"] })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vaults && vaults.map((vault: Vault) => (
          <VaultCard
            key={vault.id}
            vault={vault}
            onAddContent={handleAddContent}
            onEdit={handleEditVault}
            onDelete={handleDeleteVault}
            contentCount={getContentCount(vault.id)}
            recipientCount={getRecipientCount(vault.id)}
            nextDeliveryDate={getNextDeliveryDate(vault.id)}
          />
        ))}
        
        <div 
          className="bg-gray-50 dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 border-dashed flex flex-col justify-center items-center p-8 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={handleCreateVault}
        >
          <div className="h-12 w-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
            <Plus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Create a new vault</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Securely store and schedule your digital legacy</p>
        </div>
      </div>
      
      {/* Modals */}
      <CreateVaultModal 
        isOpen={isCreateVaultOpen} 
        onClose={() => setIsCreateVaultOpen(false)} 
        vaultToEdit={selectedVault} 
      />
      
      <CreateContentModal 
        isOpen={isCreateContentOpen} 
        onClose={() => setIsCreateContentOpen(false)} 
        vaultId={selectedVaultId} 
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vault</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the vault "{selectedVault?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVault} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VaultGrid;
