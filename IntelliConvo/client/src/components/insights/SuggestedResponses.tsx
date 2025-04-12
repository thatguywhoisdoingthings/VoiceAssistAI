import { Card, CardContent } from "@/components/ui/card";

interface SuggestedResponsesProps {
  suggestion: string;
}

export default function SuggestedResponses({ suggestion }: SuggestedResponsesProps) {
  const handleUseResponse = () => {
    // This would typically copy the response to clipboard or insert it into an input field
    navigator.clipboard.writeText(suggestion)
      .then(() => {
        console.log('Response copied to clipboard');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  if (!suggestion) {
    return null;
  }
  
  // Split response into paragraphs and bullet points
  const paragraphs: string[] = [];
  const bulletPoints: string[] = [];
  
  suggestion.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.match(/^\d+\./)) {
      bulletPoints.push(trimmedLine);
    } else if (trimmedLine) {
      paragraphs.push(trimmedLine);
    }
  });
  
  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 flex items-center justify-between mb-3">
          <span>Suggested Response</span>
          <span className="text-xs bg-accent-100 text-accent-800 px-2 py-0.5 rounded-full">AI</span>
        </h3>
        
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-sm text-gray-600 leading-relaxed mb-3">
            {paragraph}
          </p>
        ))}
        
        {bulletPoints.length > 0 && (
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1 mb-3">
            {bulletPoints.map((point, index) => (
              <li key={index}>{point.replace(/^[•\-]\s*/, '')}</li>
            ))}
          </ul>
        )}
        
        <div className="mt-3 flex justify-end">
          <button 
            className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
            onClick={handleUseResponse}
          >
            Use this response &rarr;
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
