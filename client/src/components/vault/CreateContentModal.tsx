import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { InsertContentItem } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { uploadFile } from "@/lib/firebase";
import { encryptFile, generateEncryptionKey } from "@/lib/encryption";
import { FileText, Image, Video, File, Mic, MessageSquare } from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: number | null;
}

const CreateContentModal = ({ isOpen, onClose, vaultId }: CreateContentModalProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("file");
  
  // Common fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");
  
  // Text message state
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setFilePreview("");
    setMessageText("");
    setActiveTab("file");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview for image files
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview("");
      }
      
      // Auto-populate title with filename if empty
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const getContentType = (file: File): string => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.includes("pdf")) return "document";
    return "file";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vaultId || !currentUser?.id) {
      toast({
        title: "Error",
        description: "Missing vault or user information",
        variant: "destructive",
      });
      return;
    }
    
    if (!title) {
      toast({
        title: "Error",
        description: "Please provide a title for your content",
        variant: "destructive",
      });
      return;
    }
    
    if (activeTab === "file" && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (activeTab === "message" && !messageText) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      let contentPath = "";
      let contentType = "";
      let encryptionKey = "";
      let thumbnailUrl = "";
      
      if (activeTab === "file" && selectedFile) {
        // Generate encryption key
        encryptionKey = generateEncryptionKey();
        
        // Upload the file
        const path = `content/${currentUser.id}/${vaultId}/${Date.now()}_${selectedFile.name}`;
        contentPath = await uploadFile(selectedFile, path);
        
        // Set content type
        contentType = getContentType(selectedFile);
        
        // Generate thumbnail for images
        if (contentType === "image") {
          thumbnailUrl = contentPath;
        }
      } else if (activeTab === "message") {
        // Encrypt the message
        encryptionKey = generateEncryptionKey();
        contentType = "message";
        contentPath = messageText; // Store the message directly (in a real app, you'd encrypt it)
      }
      
      const contentData: InsertContentItem = {
        title,
        description,
        contentType,
        contentPath,
        vaultId,
        userId: currentUser.id,
        encryptionKey,
        thumbnailUrl,
        metadata: {
          originalFileName: selectedFile?.name,
          size: selectedFile?.size,
          mimeType: selectedFile?.type,
        }
      };
      
      await apiRequest("POST", "/api/content", contentData);
      
      toast({
        title: "Success",
        description: "Content added successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error adding content:", error);
      toast({
        title: "Error",
        description: "Failed to add content",
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
          <DialogTitle>Add Content</DialogTitle>
          <DialogDescription>
            Add content to your vault for future delivery
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="file" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="message">Write Message</TabsTrigger>
            </TabsList>
            
            <div className="py-4">
              <div className="grid gap-4 mb-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Content title"
                    className="col-span-3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description..."
                    className="col-span-3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              
              <TabsContent value="file">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-right">
                      File
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      className="col-span-3"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                  
                  {filePreview && (
                    <div className="mt-4">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-md"
                      />
                    </div>
                  )}
                  
                  {selectedFile && !filePreview && (
                    <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex flex-col items-center">
                        <File className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="message">
                <div className="grid gap-4">
                  <Textarea
                    placeholder="Write your message here..."
                    className="min-h-[150px]"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    required
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Add Content"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContentModal;
