import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { InsertVault } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { uploadFile } from "@/lib/firebase";
import { Vault } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultToEdit?: InsertVault | null;
}

const CreateVaultModal = ({ isOpen, onClose, vaultToEdit }: CreateVaultModalProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [vaultName, setVaultName] = useState("");
  const [vaultDescription, setVaultDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [encryptionLevel, setEncryptionLevel] = useState("standard");
  const [isActive, setIsActive] = useState(true);

  const isEditMode = !!vaultToEdit;

  useEffect(() => {
    if (vaultToEdit) {
      setVaultName(vaultToEdit.name);
      setVaultDescription(vaultToEdit.description || "");
      setEncryptionLevel(vaultToEdit.encryptionLevel);
      setIsActive(vaultToEdit.isActive !== undefined ? vaultToEdit.isActive : true);
      setCoverImagePreview(vaultToEdit.coverImage || "");
    } else {
      resetForm();
    }
  }, [vaultToEdit, isOpen]);

  const resetForm = () => {
    setVaultName("");
    setVaultDescription("");
    setCoverImageFile(null);
    setCoverImagePreview("");
    setEncryptionLevel("standard");
    setIsActive(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultName) {
      toast({
        title: "Error",
        description: "Please provide a name for your vault",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a vault",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      let coverImageUrl = vaultToEdit?.coverImage || "";

      if (coverImageFile) {
        const path = `vaults/${currentUser.id}/${Date.now()}_${coverImageFile.name}`;
        coverImageUrl = await uploadFile(coverImageFile, path);
      }

      const vaultData: InsertVault = {
        name: vaultName,
        description: vaultDescription,
        coverImage: coverImageUrl,
        userId: currentUser.id,
        encryptionLevel,
        isActive,
      };

      if (isEditMode && vaultToEdit?.id) {
        await apiRequest("PUT", `/api/vaults/${vaultToEdit.id}`, vaultData);
        toast({
          title: "Success",
          description: "Vault updated successfully",
        });
      } else {
        await apiRequest("POST", "/api/vaults", vaultData);
        toast({
          title: "Success",
          description: "Vault created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/vaults"] });
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating/updating vault:", error);
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update vault" : "Failed to create vault",
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
            {isEditMode ? "Edit Vault" : "Create New Vault"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update your vault details and settings"
              : "Create a secure digital vault to store and schedule your content"
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
                placeholder="Family Memories"
                className="col-span-3"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this vault..."
                className="col-span-3"
                value={vaultDescription}
                onChange={(e) => setVaultDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cover-image" className="text-right">
                Cover Image
              </Label>
              <div className="col-span-3">
                <Input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {coverImagePreview && (
                  <div className="mt-2">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="h-40 w-full object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Encryption
              </Label>
              <div className="col-span-3">
                <RadioGroup 
                  value={encryptionLevel} 
                  onValueChange={setEncryptionLevel}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="font-normal cursor-pointer">
                      Standard Encryption
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="enhanced" id="enhanced" />
                    <Label htmlFor="enhanced" className="font-normal cursor-pointer">
                      Enhanced Encryption
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maximum" id="maximum" />
                    <Label htmlFor="maximum" className="font-normal cursor-pointer">
                      Maximum Security (with recovery key)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={isActive ? "active" : "inactive"} 
                onValueChange={(value) => setIsActive(value === "active")}
              >
                <SelectTrigger className="col-span-3" id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : isEditMode ? "Save Changes" : "Create Vault"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVaultModal;
