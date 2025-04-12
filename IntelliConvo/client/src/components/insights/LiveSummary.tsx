import { Card, CardContent } from "@/components/ui/card";

interface LiveSummaryProps {
  summary: string;
}

export default function LiveSummary({ summary }: LiveSummaryProps) {
  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Live Summary</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {summary || "Conversation summary will appear here as you speak..."}
        </p>
      </CardContent>
    </Card>
  );
}
