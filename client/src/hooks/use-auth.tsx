import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { InsertUser, User as SelectUser } from "@shared/schema";
// import { BASE_URL } from "../../../.env";

type LoginData = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginData) => Promise<void>;
  register: (credentials: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Check authentication status on mount and after window focus
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/teachers/me`, {
        withCredentials: true,
      });
      console.log("User1:", response.data);
      setUser(response.data);
      return response.data;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Check auth status when window regains focus
    const onFocus = () => {
      checkAuth();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const login = async (credentials: LoginData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/teachers/login`,
        credentials,
        { withCredentials: true }
      );
      const userData = response.data;
      setUser(userData);
      toast({ 
        title: "Login successful", 
        description: "Welcome back!" 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      toast({
        title: "Login failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: InsertUser) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/register`,
        credentials,
        { withCredentials: true }
      );
      const userData = response.data;
      setUser(userData);
      toast({
        title: "Registration successful",
        description: "You have been automatically logged in.",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      toast({
        title: "Registration failed",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/teachers/logout`, 
        {}, 
        { withCredentials: true }
      );
      setUser(null);
      toast({ title: "Logged out successfully" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Logout failed");
      toast({
        title: "Logout failed",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
