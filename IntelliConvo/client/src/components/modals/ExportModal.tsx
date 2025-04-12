import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, File } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

export interface ExportOptions {
  format: 'markdown' | 'pdf';
  includeTranscript: boolean;
  includeSummary: boolean;
  includeActionItems: boolean;
  includeTopics: boolean;
  destination: 'download' | 'email' | 'gdocs' | 'notion';
}

export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<'markdown' | 'pdf'>('markdown');
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeActionItems, setIncludeActionItems] = useState(true);
  const [includeTopics, setIncludeTopics] = useState(false);
  const [destination, setDestination] = useState<'download' | 'email' | 'gdocs' | 'notion'>('download');
  
  const handleExport = () => {
    onExport({
      format,
      includeTranscript,
      includeSummary,
      includeActionItems,
      includeTopics,
      destination
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={format === 'markdown' ? 'outline' : 'ghost'}
                className={`flex items-center justify-center px-4 py-2 ${
                  format === 'markdown' ? 'bg-primary-50 border-primary-500 text-primary-700' : ''
                }`}
                onClick={() => setFormat('markdown')}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Markdown</span>
              </Button>
              
              <Button
                type="button"
                variant={format === 'pdf' ? 'outline' : 'ghost'}
                className={`flex items-center justify-center px-4 py-2 ${
                  format === 'pdf' ? 'bg-primary-50 border-primary-500 text-primary-700' : ''
                }`}
                onClick={() => setFormat('pdf')}
              >
                <File className="mr-2 h-4 w-4" />
                <span>PDF</span>
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Export Options</Label>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="include-transcript" 
                  checked={includeTranscript}
                  onCheckedChange={(checked) => setIncludeTranscript(checked === true)}
                />
                <label htmlFor="include-transcript" className="ml-2 text-sm text-gray-700">
                  Include full transcript
                </label>
              </div>
              
              <div className="flex items-center">
                <Checkbox 
                  id="include-summary" 
                  checked={includeSummary}
                  onCheckedChange={(checked) => setIncludeSummary(checked === true)}
                />
                <label htmlFor="include-summary" className="ml-2 text-sm text-gray-700">
                  Include summary
                </label>
              </div>
              
              <div className="flex items-center">
                <Checkbox 
                  id="include-actions" 
                  checked={includeActionItems}
                  onCheckedChange={(checked) => setIncludeActionItems(checked === true)}
                />
                <label htmlFor="include-actions" className="ml-2 text-sm text-gray-700">
                  Include action items
                </label>
              </div>
              
              <div className="flex items-center">
                <Checkbox 
                  id="include-topics" 
                  checked={includeTopics}
                  onCheckedChange={(checked) => setIncludeTopics(checked === true)}
                />
                <label htmlFor="include-topics" className="ml-2 text-sm text-gray-700">
                  Include topic analysis
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Destination</Label>
            <Select value={destination} onValueChange={(value: any) => setDestination(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="download">Download File</SelectItem>
                <SelectItem value="email">Send via Email</SelectItem>
                <SelectItem value="gdocs">Save to Google Docs</SelectItem>
                <SelectItem value="notion">Save to Notion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={handleExport}>Export Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
