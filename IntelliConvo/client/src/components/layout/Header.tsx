import { Menu, HelpCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  pageTitle: string;
}

export default function Header({ sidebarOpen, setSidebarOpen, pageTitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <div className="md:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 text-gray-500 hover:text-gray-700">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-56">
                <div className="py-6 px-6">
                  <div className="flex items-center mb-8">
                    <div className="h-10 w-10 rounded-full bg-primary-500 text-white flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm0-12a2 2 0 0 1 2 2v5a2 2 0 1 1-4 0V5a2 2 0 0 1 2-2Zm4 16.5a1 1 0 0 1-.7-.3A7.8 7.8 0 0 0 12 18a7.8 7.8 0 0 0-3.3 1.2 1 1 0 0 1-1.4-1.4A9.9 9.9 0 0 1 12 16a9.9 9.9 0 0 1 4.7 1.8 1 1 0 0 1 .3.7 1 1 0 0 1-1 1Z" />
                      </svg>
                    </div>
                    <span className="text-xl font-medium">VoiceAssist AI</span>
                  </div>
                  <nav className="space-y-4">
                    <a href="/" className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 text-gray-800">
                      <Home className="mr-3 h-5 w-5" /> Home
                    </a>
                    <a href="/history" className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 text-gray-800">
                      <History className="mr-3 h-5 w-5" /> History
                    </a>
                    <a href="/interview" className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 text-gray-800">
                      <UserRound className="mr-3 h-5 w-5" /> Interview
                    </a>
                    <a href="/settings" className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 text-gray-800">
                      <Settings className="mr-3 h-5 w-5" /> Settings
                    </a>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
          <span className="ml-4 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hidden md:inline-block">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Active Session
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600" title="Help">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600" title="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// To avoid circular dependencies, just redefining the icons here
function Home(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )
}

function History(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
  )
}

function UserRound(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
  )
}

function Settings(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  )
}
