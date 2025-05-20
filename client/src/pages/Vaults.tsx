import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VaultGrid from "@/components/vault/VaultGrid";
import CreateVaultModal from "@/components/vault/CreateVaultModal";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Vaults = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to home
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Vaults</h1>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Vault
            </Button>
          </div>
          
          <VaultGrid />
        </div>
      </main>

      <CreateVaultModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        vaultToEdit={null}
      />
      
      <Footer />
    </div>
  );
};

export default Vaults;
