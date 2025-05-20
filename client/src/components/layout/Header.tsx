import { Link, useLocation } from "wouter";
import ThemeToggle from "../ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [location, navigate] = useLocation();
  
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-primary-600 dark:text-primary-400 text-xl font-bold">
                Echo<span className="text-accent-500">Vault</span>
              </Link>
            </div>
            {isAuthenticated && (
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main">
                <Link 
                  href="/dashboard" 
                  className={`border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === "/dashboard" ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium" : ""
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/vaults" 
                  className={`border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === "/vaults" ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium" : ""
                  }`}
                >
                  <span className="flex items-center">
                    My Vaults
                  </span>
                </Link>
                <Link 
                  href="/recipients" 
                  className={`border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === "/recipients" ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium" : ""
                  }`}
                >
                  <span className="flex items-center">
                    Recipients
                  </span>
                </Link>
                <Link 
                  href="/schedule" 
                  className={`border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === "/schedule" ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium" : ""
                  }`}
                >
                  <span className="flex items-center">
                    Schedule
                  </span>
                </Link>
              </nav>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatarUrl || ""} alt={currentUser?.displayName || "User"} />
                        <AvatarFallback>{currentUser?.displayName ? getInitials(currentUser.displayName) : "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser?.displayName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => navigate("/")} variant="default">
                Sign In
              </Button>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="inline-flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          {isAuthenticated ? (
            <>
              <div className="pt-2 pb-3 space-y-1">
                <Link href="/dashboard">
                  <a 
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      location === "/dashboard"
                        ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900"
                        : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </a>
                </Link>
                <Link href="/vaults">
                  <a 
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      location === "/vaults"
                        ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900"
                        : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={closeMenu}
                  >
                    My Vaults
                  </a>
                </Link>
                <Link href="/recipients">
                  <a 
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      location === "/recipients"
                        ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900"
                        : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={closeMenu}
                  >
                    Recipients
                  </a>
                </Link>
                <Link href="/schedule">
                  <a 
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      location === "/schedule"
                        ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900"
                        : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={closeMenu}
                  >
                    Schedule
                  </a>
                </Link>
                <Link href="/profile">
                  <a 
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      location === "/profile"
                        ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900"
                        : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={closeMenu}
                  >
                    Profile
                  </a>
                </Link>
                <div className="flex items-center justify-between pl-3 pr-4 py-2 border-l-4 border-transparent">
                  <span className="text-base font-medium text-gray-600 dark:text-gray-300">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={currentUser?.avatarUrl || ""} alt={currentUser?.displayName || "User"} />
                      <AvatarFallback>{currentUser?.displayName ? getInitials(currentUser.displayName) : "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">{currentUser?.displayName || "User"}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{currentUser?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <a 
                    href="#" 
                    className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                      closeMenu();
                    }}
                  >
                    Sign out
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="pt-2 pb-3 space-y-1">
              <div className="flex items-center justify-between pl-3 pr-4 py-2 border-l-4 border-transparent">
                <span className="text-base font-medium text-gray-600 dark:text-gray-300">Theme</span>
                <ThemeToggle />
              </div>
              <Link href="/">
                <a 
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-base font-medium"
                  onClick={closeMenu}
                >
                  Sign In
                </a>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
