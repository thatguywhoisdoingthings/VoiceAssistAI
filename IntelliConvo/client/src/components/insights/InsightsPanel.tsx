import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveSummary from "./LiveSummary";
import TopicCloud from "./TopicCloud";
import SuggestedResponses from "./SuggestedResponses";
import ActionItems from "./ActionItems";
import WhisperInput from "./WhisperInput";
import { Message, Topic, ActionItem } from "@/types";

interface InsightsPanelProps {
  messages: Message[];
  summary: string;
  topics: Topic[];
  actionItems: ActionItem[];
  suggestedResponse: string;
  onWhisperSubmit: (text: string) => void;
  onActionItemAdd: (text: string) => void;
  onActionItemToggle: (id: number, completed: boolean) => void;
  className?: string;
}

export default function InsightsPanel({
  messages,
  summary,
  topics,
  actionItems,
  suggestedResponse,
  onWhisperSubmit,
  onActionItemAdd,
  onActionItemToggle,
  className = ""
}: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState("summary");
  
  return (
    <div className={`w-full md:w-96 flex flex-col overflow-hidden bg-white border-l border-gray-200 ${className}`}>
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3">
          <h2 className="text-lg font-medium text-gray-800">Insights</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" title="Expand">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="px-4 pb-0">
          <div className="bg-transparent w-full flex justify-start space-x-1 p-0">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-3 py-1.5 text-sm font-medium rounded-t-lg ${
                activeTab === "summary" 
                  ? "text-primary-700 bg-primary-100 border-b-2 border-primary-500" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("topics")}
              className={`px-3 py-1.5 text-sm font-medium rounded-t-lg ${
                activeTab === "topics" 
                  ? "text-primary-700 bg-primary-100 border-b-2 border-primary-500" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              Topics
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-3 py-1.5 text-sm font-medium rounded-t-lg ${
                activeTab === "questions" 
                  ? "text-primary-700 bg-primary-100 border-b-2 border-primary-500" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={`px-3 py-1.5 text-sm font-medium rounded-t-lg ${
                activeTab === "actions" 
                  ? "text-primary-700 bg-primary-100 border-b-2 border-primary-500" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              Actions
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === "summary" && (
          <div className="space-y-6">
            <LiveSummary summary={summary} />
            <SuggestedResponses suggestion={suggestedResponse} />
            {actionItems.length > 0 && <ActionItems 
              actionItems={actionItems}
              onActionItemToggle={onActionItemToggle}
              onActionItemAdd={onActionItemAdd}
            />}
          </div>
        )}
        
        {activeTab === "topics" && (
          <div className="space-y-6">
            <TopicCloud topics={topics} />
          </div>
        )}
        
        {activeTab === "questions" && (
          <div className="space-y-6">
            <SuggestedResponses suggestion={suggestedResponse} />
          </div>
        )}
        
        {activeTab === "actions" && (
          <div className="space-y-6">
            <ActionItems 
              actionItems={actionItems}
              onActionItemToggle={onActionItemToggle}
              onActionItemAdd={onActionItemAdd}
            />
          </div>
        )}
      </div>
      
      <WhisperInput onSubmit={onWhisperSubmit} />
    </div>
  );
}
