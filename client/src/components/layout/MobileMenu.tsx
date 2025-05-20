import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-black dark:bg-opacity-60" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white dark:bg-gray-800 shadow-xl transform transition duration-300 ease-in-out">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-primary-600 dark:text-primary-400 text-xl font-bold">
              Echo<span className="text-accent-500">Vault</span>
            </span>
          </div>
          <button
            className="text-gray-500 dark:text-gray-300 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-col h-full overflow-y-auto">
          {isAuthenticated ? (
            <div className="py-4 flex-1">
              <div className="px-4 mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
                    {currentUser?.displayName?.charAt(0) || "U"}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {currentUser?.displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <nav className="space-y-1 px-2">
                <Link href="/dashboard">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location === "/dashboard" 
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`} onClick={onClose}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/vaults">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location === "/vaults" 
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`} onClick={onClose}>
                    My Vaults
                  </a>
                </Link>
                <Link href="/recipients">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location === "/recipients" 
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`} onClick={onClose}>
                    Recipients
                  </a>
                </Link>
                <Link href="/schedule">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location === "/schedule" 
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`} onClick={onClose}>
                    Schedule
                  </a>
                </Link>
                <Link href="/profile">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location === "/profile" 
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`} onClick={onClose}>
                    Profile
                  </a>
                </Link>
              </nav>
            </div>
          ) : (
            <div className="py-4 px-4">
              <Link href="/">
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-primary-700 dark:text-primary-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}>
                  Sign In
                </a>
              </Link>
            </div>
          )}
          
          {isAuthenticated && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                className="flex items-center px-3 py-2 w-full text-sm font-medium rounded-md text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
