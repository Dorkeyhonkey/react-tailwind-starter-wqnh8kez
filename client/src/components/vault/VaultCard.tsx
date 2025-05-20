import { useState } from "react";
import { useLocation } from "wouter";
import { Vault } from "@shared/schema";
import { format } from "date-fns";
import { FileText, Image, Video, FileArchive, MoreHorizontal, LockIcon, Calendar, Users, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getImagePlaceholder } from "@/lib/utils";

interface VaultCardProps {
  vault: Vault;
  onAddContent: (vaultId: number) => void;
  onEdit: (vault: Vault) => void;
  onDelete: (vault: Vault) => void;
  contentCount: number;
  recipientCount: number;
  nextDeliveryDate?: Date;
}

const VaultCard = ({
  vault,
  onAddContent,
  onEdit,
  onDelete,
  contentCount,
  recipientCount,
  nextDeliveryDate,
}: VaultCardProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getIconByVaultType = () => {
    switch (true) {
      case vault.name.toLowerCase().includes("document"):
        return <FileText className="h-6 w-6 text-accent-600 dark:text-accent-400" />;
      case vault.name.toLowerCase().includes("photo") || vault.name.toLowerCase().includes("image"):
        return <Image className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case vault.name.toLowerCase().includes("video"):
        return <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      default:
        return <FileArchive className="h-6 w-6 text-primary-600 dark:text-primary-400" />;
    }
  };

  const handleViewVault = () => {
    navigate(`/vaults/${vault.id}`);
  };

  const handleEditVault = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(vault);
  };

  const handleDeleteVault = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contentCount > 0) {
      toast({
        title: "Cannot Delete Vault",
        description: `This vault contains ${contentCount} items. Please remove all content first.`,
        variant: "destructive",
      });
      return;
    }
    
    onDelete(vault);
  };

  const handleAddContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddContent(vault.id);
  };

  const formatUpdatedDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 1) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return format(date, "MMM d, yyyy");
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleViewVault}
    >
      <div className="relative">
        <img 
          src={vault.coverImage || getImagePlaceholder(vault.name)} 
          alt={vault.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-white text-lg font-medium">{vault.name}</h3>
          <p className="text-white/80 text-sm">
            {vault.description?.length > 30 
              ? `${vault.description.substring(0, 30)}...` 
              : vault.description}
          </p>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <Badge variant={vault.isActive ? "success" : "secondary"}>
            {vault.isActive ? "Active" : "Inactive"}
          </Badge>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last updated {formatUpdatedDate(vault.updatedAt)}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {vault.description || "No description provided."}
        </p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Content items:</span>
            <span className="font-medium text-gray-900 dark:text-white">{contentCount} items</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Recipients:</span>
            <span className="font-medium text-gray-900 dark:text-white">{recipientCount} people</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Security level:</span>
            <span className="font-medium text-gray-900 dark:text-white">{vault.encryptionLevel}</span>
          </div>
          {nextDeliveryDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Next delivery:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {format(nextDeliveryDate, "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleEditVault}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit vault details</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddContent}
          >
            Add Content
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Vault Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewVault}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditVault}>Edit Vault</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                onClick={handleDeleteVault}
              >
                Delete Vault
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;
