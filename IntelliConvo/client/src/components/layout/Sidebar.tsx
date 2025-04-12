import { Link, useLocation } from "wouter";
import { Home, History, UserRound, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="hidden md:flex flex-col w-20 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex flex-col items-center py-6">
        <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm0-12a2 2 0 0 1 2 2v5a2 2 0 1 1-4 0V5a2 2 0 0 1 2-2Zm4 16.5a1 1 0 0 1-.7-.3A7.8 7.8 0 0 0 12 18a7.8 7.8 0 0 0-3.3 1.2 1 1 0 0 1-1.4-1.4A9.9 9.9 0 0 1 12 16a9.9 9.9 0 0 1 4.7 1.8 1 1 0 0 1 .3.7 1 1 0 0 1-1 1Z" />
          </svg>
        </div>
        
        <nav className="flex flex-col items-center space-y-8 mt-4">
          <Link href="/">
            <div className={cn(
              "p-2 rounded-lg cursor-pointer",
              isActive("/") ? "text-primary-600 bg-primary-50" : "text-gray-500 hover:text-primary-600 hover:bg-gray-100"
            )}>
              <Home className="h-6 w-6" />
            </div>
          </Link>
          
          <Link href="/history">
            <div className={cn(
              "p-2 rounded-lg cursor-pointer",
              isActive("/history") ? "text-primary-600 bg-primary-50" : "text-gray-500 hover:text-primary-600 hover:bg-gray-100"
            )}>
              <History className="h-6 w-6" />
            </div>
          </Link>
          
          <Link href="/interview">
            <div className={cn(
              "p-2 rounded-lg cursor-pointer",
              isActive("/interview") ? "text-primary-600 bg-primary-50" : "text-gray-500 hover:text-primary-600 hover:bg-gray-100"
            )}>
              <UserRound className="h-6 w-6" />
            </div>
          </Link>
          
          <Link href="/settings">
            <div className={cn(
              "p-2 rounded-lg cursor-pointer",
              isActive("/settings") ? "text-primary-600 bg-primary-50" : "text-gray-500 hover:text-primary-600 hover:bg-gray-100"
            )}>
              <Settings className="h-6 w-6" />
            </div>
          </Link>
        </nav>
        
        <div className="mt-auto mb-6">
          <button className="text-gray-500 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-100">
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
