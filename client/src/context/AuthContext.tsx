import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  getCurrentUser,
  onAuthChanged
} from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isLoading: true,
  currentUser: null,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          // Get or create user in our backend
          const response = await fetch(`/api/users?email=${firebaseUser.email}`);
          
          if (response.ok) {
            const userData = await response.json();
            if (userData) {
              setCurrentUser(userData);
              setIsAuthenticated(true);
            } else {
              // User not found in our database, create one
              if (firebaseUser.email) {
                const newUser = {
                  username: firebaseUser.email.split('@')[0],
                  email: firebaseUser.email,
                  password: `firebase_auth_${Date.now()}`, // Placeholder password, not used for login
                  displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                  avatarUrl: firebaseUser.photoURL || ""
                };
                
                const createResponse = await apiRequest("POST", "/api/auth/register", newUser);
                setCurrentUser(createResponse);
                setIsAuthenticated(true);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await loginWithEmail(email, password);
      const response = await apiRequest("POST", "/api/auth/login", {
        username: email.split('@')[0],
        password: password
      });
      
      setCurrentUser(response);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await registerWithEmail(email, password);
      
      const newUser = {
        username: email.split('@')[0],
        email,
        password,
        displayName,
        avatarUrl: ""
      };
      
      const response = await apiRequest("POST", "/api/auth/register", newUser);
      setCurrentUser(response);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      const firebaseUser = result.user;
      
      if (firebaseUser.email) {
        // Check if user exists in our database
        try {
          const response = await fetch(`/api/users?email=${firebaseUser.email}`);
          
          if (response.ok) {
            const userData = await response.json();
            if (userData) {
              setCurrentUser(userData);
              setIsAuthenticated(true);
              return;
            }
          }
          
          // User not found in our database, create one
          const newUser = {
            username: firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            password: `firebase_auth_${Date.now()}`, // Placeholder password, not used for login
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            avatarUrl: firebaseUser.photoURL || ""
          };
          
          const createResponse = await apiRequest("POST", "/api/auth/register", newUser);
          setCurrentUser(createResponse);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error handling Google login:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    register,
    loginWithGoogle: googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
