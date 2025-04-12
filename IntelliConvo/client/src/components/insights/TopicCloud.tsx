import { Card, CardContent } from "@/components/ui/card";
import { Topic } from "@/types";

interface TopicCloudProps {
  topics: Topic[];
}

export default function TopicCloud({ topics }: TopicCloudProps) {
  // Sort topics by weight, descending
  const sortedTopics = [...topics].sort((a, b) => b.weight - a.weight);
  
  // Split topics into highlighted (higher weight) and regular
  const highlightedTopics = sortedTopics.slice(0, 3);
  const regularTopics = sortedTopics.slice(3);
  
  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Detected Topics</h3>
        {topics.length === 0 ? (
          <p className="text-sm text-gray-500">Topics will appear here as the conversation progresses...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {highlightedTopics.map((topic) => (
              <span 
                key={topic.id} 
                className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {topic.topic}
              </span>
            ))}
            
            {regularTopics.map((topic) => (
              <span 
                key={topic.id} 
                className="inline-block px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full"
              >
                {topic.topic}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
