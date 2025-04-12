import { Link, useLocation } from "wouter";
import { Mic, History, UserCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="md:hidden bg-white border-t border-gray-200 py-2 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-around">
        <Link href="/">
          <a className={cn(
            "p-2",
            isActive("/") 
              ? "text-primary-600 rounded-full bg-primary-50" 
              : "text-gray-500 hover:text-primary-600"
          )}>
            <Mic className="h-5 w-5" />
          </a>
        </Link>
        
        <Link href="/history">
          <a className={cn(
            "p-2",
            isActive("/history") 
              ? "text-primary-600 rounded-full bg-primary-50" 
              : "text-gray-500 hover:text-primary-600"
          )}>
            <History className="h-5 w-5" />
          </a>
        </Link>
        
        <Link href="/interview">
          <a className={cn(
            "p-2",
            isActive("/interview") 
              ? "text-primary-600 rounded-full bg-primary-50" 
              : "text-gray-500 hover:text-primary-600"
          )}>
            <UserCircle className="h-5 w-5" />
          </a>
        </Link>
        
        <Link href="/settings">
          <a className={cn(
            "p-2",
            isActive("/settings") 
              ? "text-primary-600 rounded-full bg-primary-50" 
              : "text-gray-500 hover:text-primary-600"
          )}>
            <Settings className="h-5 w-5" />
          </a>
        </Link>
      </div>
    </div>
  );
}
