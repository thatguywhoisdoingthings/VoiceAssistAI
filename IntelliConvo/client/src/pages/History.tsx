import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, Download, Mic } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Transcript } from "@/types";

export default function History() {
  const { data: transcripts, isLoading } = useQuery<Transcript[]>({
    queryKey: ['/api/transcripts'],
  });
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Conversation History</h1>
        <p className="text-gray-600">Access and manage your past recordings and transcripts.</p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-48 animate-pulse">
              <CardContent className="p-6">
                <div className="bg-gray-200 h-4 w-3/4 rounded mb-4"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded mb-8"></div>
                <div className="bg-gray-200 h-20 w-full rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : transcripts && transcripts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transcripts.map((transcript) => (
            <TranscriptCard key={transcript.id} transcript={transcript} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

interface TranscriptCardProps {
  transcript: Transcript;
}

function TranscriptCard({ transcript }: TranscriptCardProps) {
  // Truncate summary
  const truncatedSummary = transcript.summary
    ? transcript.summary.length > 120
      ? transcript.summary.substring(0, 120) + "..."
      : transcript.summary
    : "No summary available";
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{transcript.title}</h3>
          <span className="text-xs flex items-center gap-1 text-gray-500">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(transcript.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {truncatedSummary}
        </p>
        
        <div className="flex space-x-2 justify-end">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Download className="h-4 w-4" />
          </Button>
          <Link href={`/?id=${transcript.id}`}>
            <Button variant="outline" size="sm" className="font-medium">
              Open
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-6 mb-6">
        <Mic className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
      <p className="text-gray-600 mb-6 max-w-md">
        Start a new recording session to transcribe and analyze conversations.
      </p>
      <Link href="/">
        <Button>
          Start Recording
        </Button>
      </Link>
    </div>
  );
}
