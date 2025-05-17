import { Home, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect } from "react";
import { Redirect } from "wouter";

interface HeaderProps {
  selectedClass?: string;
  selectedSubject?: string;
  showContext: boolean;
  onHomeClick: () => void;
}

export default function Header({
  selectedClass,
  selectedSubject,
  showContext,
  onHomeClick,
}: HeaderProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    // logoutMutation.mutate();
  };

  useEffect(() => {
    // console.log(user);
  }, [user]);

  if (!user) {
    <Redirect to="/auth" />; 

  }

  return (
    <header className="bg-primary text-white p-4 shadow-md relative z-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Daily Viva Tracker</h1>
          <div
            className={`text-sm mt-1 transition-opacity duration-300 ${
              showContext ? "opacity-100" : "opacity-0"
            }`}
          >
            <span>{selectedSubject} </span>
          </div> 
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onHomeClick}
            className={`text-white transition-opacity duration-300 ${
              showContext ? "opacity-100" : "opacity-0"
            }`}
          >
            <Home className="w-5 h-5" />
          </button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="bg-primary-foreground text-primary text-sm">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                  // disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{"Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
