import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  FileText, 
  AlertCircle, 
  Check, 
  Briefcase, 
  GraduationCap, 
  Building, 
  Calendar, 
  Mail, 
  MessageSquare,
  User,
  Clock,
  Search,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContextPrepModeProps {
  onComplete: (data: ContextData) => void;
  onCancel: () => void;
  mode?: 'interview' | 'meeting' | 'general';
}

export interface ContextData {
  resumeText: string;
  jobDescriptionText: string;
  companyInfo: string;
  keyPoints: string[];
  calendarEvents?: CalendarEvent[];
  emailThreads?: EmailThread[];
  chatMessages?: ChatMessage[];
  contextMode: 'interview' | 'meeting' | 'general';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  description?: string;
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  date: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  date: string;
  content: string;
  platform: string;
}

export default function ContextPrepMode({ onComplete, onCancel, mode = 'interview' }: ContextPrepModeProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(mode === 'interview' ? "resume" : "context");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [contextData, setContextData] = useState<ContextData>({
    resumeText: "",
    jobDescriptionText: "",
    companyInfo: "",
    keyPoints: [],
    calendarEvents: [],
    emailThreads: [],
    chatMessages: [],
    contextMode: mode
  });
  const [generatedKeyPoints, setGeneratedKeyPoints] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState({
    calendar: true,
    email: true,
    chat: true
  });

  const handleTextChange = (field: keyof ContextData, value: string) => {
    setContextData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnalyze = async () => {
    // Validate inputs
    if (!contextData.resumeText.trim()) {
      toast({
        title: "Resume Required",
        description: "Please enter your resume text to continue.",
        variant: "destructive"
      });
      setActiveTab("resume");
      return;
    }

    if (!contextData.jobDescriptionText.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter the job description to continue.",
        variant: "destructive"
      });
      setActiveTab("job");
      return;
    }

    // Start analysis
    setAnalyzing(true);

    try {
      // Simulate API call to OpenAI
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock key points based on the input text
      const mockKeyPoints = [
        "Your experience with React and TypeScript aligns well with the job requirements.",
        "Highlight your project management experience as it's mentioned in the job description.",
        "Emphasize your communication skills and team collaboration.",
        "Prepare to discuss your experience with database technologies.",
        "Be ready to talk about your problem-solving approach for complex technical challenges."
      ];

      setGeneratedKeyPoints(mockKeyPoints);
      setContextData(prev => ({
        ...prev,
        keyPoints: mockKeyPoints
      }));
      
      setAnalysisComplete(true);
      setAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "We've analyzed your resume and job description and prepared key talking points.",
      });
      
      // Move to results tab
      setActiveTab("results");
    } catch (error) {
      setAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your input. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleComplete = () => {
    onComplete(contextData);
  };

  // Function to simulate fetching calendar events
  const fetchCalendarEvents = async () => {
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockCalendarEvents: CalendarEvent[] = [
      {
        id: "cal1",
        title: "Weekly Team Sync",
        date: "2025-04-15",
        time: "10:00 AM",
        attendees: ["John Smith", "Maria Garcia", "Ahmed Khan"],
        description: "Weekly sync to discuss project progress and blockers."
      },
      {
        id: "cal2",
        title: "Product Review",
        date: "2025-04-16",
        time: "2:00 PM",
        attendees: ["Sarah Johnson", "David Chen", "Emma Wilson"],
        description: "Review new features and get feedback."
      },
      {
        id: "cal3",
        title: "Client Meeting - Acme Corp",
        date: "2025-04-17",
        time: "11:30 AM",
        attendees: ["Alex Rodriguez", "Taylor Swift", "James Brown"],
        description: "Discuss implementation timeline and next steps."
      }
    ];
    
    setContextData(prev => ({
      ...prev,
      calendarEvents: mockCalendarEvents
    }));
    
    setIsSearching(false);
  };
  
  // Function to simulate fetching email threads
  const fetchEmailThreads = async () => {
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const mockEmailThreads: EmailThread[] = [
      {
        id: "email1",
        subject: "Re: Project Timeline Updates",
        participants: ["you@example.com", "manager@example.com", "team@example.com"],
        date: "2025-04-10",
        snippet: "I've updated the timeline based on our discussion yesterday. Please review the attached document..."
      },
      {
        id: "email2",
        subject: "Meeting Notes - Strategic Planning",
        participants: ["you@example.com", "director@example.com"],
        date: "2025-04-08",
        snippet: "Attached are the notes from our strategic planning session. Key action items highlighted in yellow..."
      },
      {
        id: "email3",
        subject: "Fwd: Client Feedback on Demo",
        participants: ["you@example.com", "clientsuccess@example.com"],
        date: "2025-04-05",
        snippet: "The client was very impressed with the demo. They had a few suggestions for improvements..."
      }
    ];
    
    setContextData(prev => ({
      ...prev,
      emailThreads: mockEmailThreads
    }));
    
    setIsSearching(false);
  };
  
  // Function to simulate fetching chat messages
  const fetchChatMessages = async () => {
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockChatMessages: ChatMessage[] = [
      {
        id: "chat1",
        sender: "Maria Garcia",
        date: "2025-04-11",
        content: "Can you share your thoughts on the new design proposal before tomorrow's meeting?",
        platform: "Slack"
      },
      {
        id: "chat2",
        sender: "David Chen",
        date: "2025-04-10",
        content: "I've pushed the fix for that bug we discussed. Can you review when you have a chance?",
        platform: "Teams"
      },
      {
        id: "chat3",
        sender: "Ahmed Khan",
        date: "2025-04-09",
        content: "The client is asking about the timeline for the next milestone. Do we have an update?",
        platform: "Slack"
      }
    ];
    
    setContextData(prev => ({
      ...prev,
      chatMessages: mockChatMessages
    }));
    
    setIsSearching(false);
  };
  
  // Function to search across all content types
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search Term Required",
        description: "Please enter a search term to find relevant context.",
      });
      return;
    }
    
    toast({
      title: "Searching...",
      description: "Looking for relevant information across your connected accounts.",
    });
    
    if (selectedItems.calendar) fetchCalendarEvents();
    if (selectedItems.email) fetchEmailThreads();
    if (selectedItems.chat) fetchChatMessages();
    
    setTimeout(() => {
      setAnalysisComplete(true);
      setActiveTab("results");
      
      toast({
        title: "Search Complete",
        description: "We've found relevant context to help prepare for your meeting.",
      });
    }, 2500);
  };
  
  // Function to toggle data source selection
  const toggleDataSource = (source: 'calendar' | 'email' | 'chat') => {
    setSelectedItems(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };
  
  // Title and description based on mode
  const getTitleAndDescription = () => {
    switch (contextData.contextMode) {
      case 'interview':
        return {
          title: "Interview Prep",
          description: "Enter your resume and job information to get personalized interview preparation."
        };
      case 'meeting':
        return {
          title: "Meeting Prep",
          description: "Gather context from your calendar, emails, and chats to prepare for your upcoming meeting."
        };
      case 'general':
        return {
          title: "Conversation Prep",
          description: "Get insights and talking points from your recent interactions to prepare for your conversation."
        };
    }
  };
  
  const { title, description } = getTitleAndDescription();
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid ${contextData.contextMode === 'interview' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {contextData.contextMode === 'interview' && (
              <>
                <TabsTrigger value="resume" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resume
                </TabsTrigger>
                <TabsTrigger value="job" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Details
                </TabsTrigger>
              </>
            )}
            
            {contextData.contextMode !== 'interview' && (
              <TabsTrigger value="context" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Find Context
              </TabsTrigger>
            )}
            
            <TabsTrigger value="results" className="flex items-center gap-2" disabled={!analysisComplete}>
              <Check className="h-4 w-4" />
              Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="resume" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="resume">Your Resume</Label>
              <Textarea
                id="resume"
                placeholder="Paste your resume text here..."
                className="min-h-[300px]"
                value={contextData.resumeText}
                onChange={(e) => handleTextChange("resumeText", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This will be analyzed to match your skills with the job requirements.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button onClick={() => setActiveTab("job")}>
                Next
                <span className="ml-2">→</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="job" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here..."
                className="min-h-[200px]"
                value={contextData.jobDescriptionText}
                onChange={(e) => handleTextChange("jobDescriptionText", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyInfo">Company Information (Optional)</Label>
              <Textarea
                id="companyInfo"
                placeholder="Add any information about the company that might be relevant..."
                className="min-h-[100px]"
                value={contextData.companyInfo}
                onChange={(e) => handleTextChange("companyInfo", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This helps personalize your interview preparation and talking points.
              </p>
            </div>
            
            <div className="flex justify-between space-x-2">
              <Button variant="outline" onClick={() => setActiveTab("resume")}>
                <span className="mr-2">←</span>
                Back
              </Button>
              <Button onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>Analyze</>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 mt-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-green-800 font-medium">Analysis Complete</h3>
              </div>
              <p className="text-green-700 text-sm mt-1">
                We've analyzed your resume and job description and identified key talking points.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-lg font-medium">Key Talking Points</Label>
              <div className="space-y-2 mt-2">
                {generatedKeyPoints.map((point, index) => (
                  <div key={index} className="flex items-start p-3 bg-blue-50 rounded-md">
                    <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4 text-blue-700" />
                    </div>
                    <p className="text-blue-800">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-yellow-800 font-medium">Preparation Tip</h3>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Review these points and prepare specific examples from your experience that highlight each one.
              </p>
            </div>
            
            <div className="flex justify-between space-x-2">
              <Button variant="outline" onClick={() => setActiveTab("job")}>
                <span className="mr-2">←</span>
                Back
              </Button>
              <Button onClick={handleComplete}>
                {contextData.contextMode === 'interview' ? 'Start Interview' : 'Start Session'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="context" className="space-y-4 mt-4">
            <div className="space-y-6">
              <div>
                <Label htmlFor="searchTerm">What are you preparing for?</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="searchTerm"
                    placeholder="E.g., Project review meeting, Client call with Acme Corp, etc."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a topic, meeting name, or keywords to find relevant context from your connected accounts.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Include data from:</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="calendar-switch" 
                      checked={selectedItems.calendar}
                      onCheckedChange={() => toggleDataSource('calendar')}
                    />
                    <Label htmlFor="calendar-switch" className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      Calendar
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="email-switch" 
                      checked={selectedItems.email}
                      onCheckedChange={() => toggleDataSource('email')}
                    />
                    <Label htmlFor="email-switch" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-orange-500" />
                      Email
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="chat-switch" 
                      checked={selectedItems.chat}
                      onCheckedChange={() => toggleDataSource('chat')}
                    />
                    <Label htmlFor="chat-switch" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                      Chat
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-blue-800 font-medium">Privacy Note</h3>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Your data is processed locally and not stored on our servers. We use AI to extract only the relevant context needed for your conversation.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
              </div>
            </div>
          </TabsContent>
          
          {contextData.contextMode !== 'interview' && analysisComplete && (
            <TabsContent value="results" className="space-y-6 mt-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="text-green-800 font-medium">Context Analysis Complete</h3>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  We've found relevant information to help prepare for your {contextData.contextMode === 'meeting' ? 'meeting' : 'conversation'}.
                </p>
              </div>
              
              {contextData.calendarEvents && contextData.calendarEvents.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Relevant Calendar Events
                  </h3>
                  <ScrollArea className="h-[180px] rounded-md border p-4">
                    <div className="space-y-4">
                      {contextData.calendarEvents.map(event => (
                        <div key={event.id} className="bg-blue-50 rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-blue-900">{event.title}</h4>
                            <div className="flex items-center text-sm text-blue-700">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{event.date} at {event.time}</span>
                            </div>
                          </div>
                          <p className="text-sm text-blue-800 mt-1">{event.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.attendees.map((attendee, i) => (
                              <Badge key={i} variant="outline" className="bg-blue-100 text-blue-800">
                                <User className="h-3 w-3 mr-1" />{attendee}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {contextData.emailThreads && contextData.emailThreads.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-orange-500" />
                    Relevant Email Threads
                  </h3>
                  <ScrollArea className="h-[180px] rounded-md border p-4">
                    <div className="space-y-4">
                      {contextData.emailThreads.map(email => (
                        <div key={email.id} className="bg-orange-50 rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-orange-900">{email.subject}</h4>
                            <span className="text-sm text-orange-700">{email.date}</span>
                          </div>
                          <p className="text-sm text-orange-800 mt-1">{email.snippet}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {email.participants.map((participant, i) => (
                              <Badge key={i} variant="outline" className="bg-orange-100 text-orange-800">
                                {participant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {contextData.chatMessages && contextData.chatMessages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
                    Relevant Chat Messages
                  </h3>
                  <ScrollArea className="h-[180px] rounded-md border p-4">
                    <div className="space-y-4">
                      {contextData.chatMessages.map(chat => (
                        <div key={chat.id} className="bg-green-50 rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-green-900 flex items-center">
                              {chat.sender}
                              <Badge className="ml-2 bg-green-100 text-green-800">
                                {chat.platform}
                              </Badge>
                            </h4>
                            <span className="text-sm text-green-700">{chat.date}</span>
                          </div>
                          <p className="text-sm text-green-800 mt-1">{chat.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-lg font-medium">Key Talking Points</Label>
                <div className="space-y-2 mt-2">
                  {(contextData.contextMode === 'meeting' || contextData.contextMode === 'general') ? [
                    "Reference the project timeline updates from the recent email thread",
                    "Follow up on the design proposal mentioned in Maria's Slack message",
                    "Discuss the next steps for the Acme Corp client implementation",
                    "Address David's code fix and coordinate review process",
                    "Confirm attendees for the upcoming Product Review meeting"
                  ].map((point, index) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 rounded-md">
                      <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                        <Check className="h-4 w-4 text-blue-700" />
                      </div>
                      <p className="text-blue-800">{point}</p>
                    </div>
                  )) : generatedKeyPoints.map((point, index) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 rounded-md">
                      <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                        <Check className="h-4 w-4 text-blue-700" />
                      </div>
                      <p className="text-blue-800">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between space-x-2">
                <Button variant="outline" onClick={() => setActiveTab(contextData.contextMode === 'interview' ? "job" : "context")}>
                  <span className="mr-2">←</span>
                  Back
                </Button>
                <Button onClick={handleComplete}>
                  {(contextData.contextMode === 'meeting' || contextData.contextMode === 'general') ? 'Start Session' : 'Start Interview'}
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}