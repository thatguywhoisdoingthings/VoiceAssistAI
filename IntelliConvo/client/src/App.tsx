import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import History from "@/pages/History";
import Interview from "@/pages/Interview";
import Settings from "@/pages/Settings";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import { initWebSocket } from "./lib/websocket";
import { useMobile } from "./hooks/use-mobile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/history" component={History} />
      <Route path="/interview" component={Interview} />
      <Route path="/settings" component={Settings} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const cleanup = initWebSocket();
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
        {!isMobile && <Sidebar />}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            pageTitle={
              location === "/" ? "VoiceAssist AI" :
              location === "/history" ? "Conversation History" :
              location === "/interview" ? "Interview Practice" :
              location === "/settings" ? "Settings" : "VoiceAssist AI"
            }
          />
          
          <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <Router />
          </main>
          
          {isMobile && <MobileNav />}
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
