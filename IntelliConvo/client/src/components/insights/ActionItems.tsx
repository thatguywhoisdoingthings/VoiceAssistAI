import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle } from "lucide-react";
import { ActionItem } from "@/types";

interface ActionItemsProps {
  actionItems: ActionItem[];
  onActionItemToggle: (id: number, completed: boolean) => void;
  onActionItemAdd: (text: string) => void;
}

export default function ActionItems({ 
  actionItems, 
  onActionItemToggle,
  onActionItemAdd 
}: ActionItemsProps) {
  
  if (actionItems.length === 0) {
    return null;
  }
  
  const handleSaveTask = (item: ActionItem) => {
    // This could integrate with external task systems
    console.log('Saving task:', item);
  };
  
  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Detected Action Items</h3>
        
        <div className="space-y-2">
          {actionItems.map((item) => (
            <div 
              key={item.id} 
              className="flex items-start gap-2 p-2 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="mt-0.5 text-green-500">
                <CheckCircle className="h-4 w-4" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id={`action-${item.id}`}
                    checked={item.completed} 
                    onCheckedChange={(checked) => {
                      onActionItemToggle(item.id, checked === true);
                    }}
                    className="mt-1"
                  />
                  <label 
                    htmlFor={`action-${item.id}`}
                    className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                  >
                    {item.text}
                  </label>
                </div>
                
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Auto-detected from conversation
                </p>
              </div>
              
              <button 
                className="text-gray-400 hover:text-gray-600" 
                title="Save to task list"
                onClick={() => handleSaveTask(item)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14"/>
                  <path d="M5 12h14"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
