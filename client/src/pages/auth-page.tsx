import { useState } from "react";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { GraduationCap } from "lucide-react";
import axios from "axios";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isLogin) {
      loginMutation.mutate(
        { username, password },
        {
          onError: (error: Error) => {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      registerMutation.mutate(
        { username, password },
        {
          onError: (error: Error) => {
            toast({
              title: "Registration failed",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  axios.get('http://localhost:5000/api/students', { withCredentials: true })
  .then(response => {
    // Handle the fetched data
    console.log(response.data);
  });
 
  

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-2">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Teacher Evaluation Platform
          </h1>
          <p className="text-gray-500 mt-1">
            Sign in to manage student evaluations
          </p>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Register"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your account"
                : "Create a new account to get started"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {loginMutation.isPending || registerMutation.isPending
                  ? "Processing..."
                  : isLogin
                  ? "Login"
                  : "Register"}
              </Button>
              <p className="text-sm text-center text-gray-500">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary font-medium ml-1 hover:underline"
                >
                  {isLogin ? "Register" : "Login"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
