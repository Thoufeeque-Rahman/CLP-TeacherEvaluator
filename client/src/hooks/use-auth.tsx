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
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load user on mount (optional: based on token/cookie)
  useEffect(() => {
    fetchUser(user?.id);
  }, []);

  const baseUrl = "https://daily-viva-tracker.onrender.com";
  // const baseUrl = "http://localhost:5000";
  
  const fetchUser = async (teacherID: number | undefined) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/teachers/${teacherID}`,
        {
          withCredentials: true,
        }
      );
      // console.log(res.data);

      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${baseUrl}/api/teachers/login`,
        credentials,
        { withCredentials: true }
      );
      const data = response.data;
      // console.log(data);
      setUser(data.user);
      setTeacherId(data.userId);
      // console.log(data.userId);

      localStorage.setItem("token", data.token);
      await fetchUser(data.userId);
      if (user) toast({ title: "Login successful", description: "Welcome back!" }); await fetchUser(data.userId);
      // fetchUser();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  }; 

  const register = async (credentials: InsertUser) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${baseUrl}/api/teachers/register`,
        credentials,
        { withCredentials: true }
      );
      const data = response.data;
      setUser(data.user);
      toast({
        title: "Registration successful",
        description: "You can now log in.",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Registration failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${baseUrl}/api/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      localStorage.removeItem("token");
      toast({ title: "Logged out successfully" });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Logout failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, register, logout }}
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
