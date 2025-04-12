import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AppSettings } from "@/types";
import { getAudioDevices, setMonitorMode } from "@/lib/audioRecorder";
import AudioMonitor from "@/components/audio/AudioMonitor";
import {
  Settings as SettingsIcon,
  RefreshCw,
  Volume2,
  Mic,
  Moon,
  Sun,
  Laptop,
  Globe,
  Key,
  Keyboard,
  Info,
  Mail
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [tab, setTab] = useState("general");
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Default settings
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'en-US',
    audioInputDevice: '',
    audioOutputDevice: '',
    transcriptionEnabled: true,
    aiModel: 'auto',
    privacyMode: false,
    monitorMode: false,
    monitorDevice: '',
    hotkeys: {
      startRecording: 'Ctrl+R',
      stopRecording: 'Ctrl+S',
      replayLastMinute: 'Ctrl+P',
      toggleSpeaker: 'Ctrl+T'
    }
  });
  
  // Load audio devices
  useEffect(() => {
    async function loadDevices() {
      try {
        const devices = await getAudioDevices();
        setAudioDevices(devices);
        
        // Set default devices if not already set
        if (!settings.audioInputDevice && devices.length > 0) {
          setSettings(prev => ({
            ...prev,
            audioInputDevice: devices[0].deviceId
          }));
        }
      } catch (error) {
        console.error('Error loading audio devices:', error);
      }
    }
    
    loadDevices();
  }, []);
  
  // Load settings from local storage
  useEffect(() => {
    const savedSettings = localStorage.getItem('voiceassist-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsedSettings
        }));
        
        // Apply monitor mode settings from loaded settings
        if (parsedSettings.monitorMode && parsedSettings.monitorDevice) {
          setMonitorMode(parsedSettings.monitorMode, parsedSettings.monitorDevice);
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);
  
  // Save settings
  const saveSettings = () => {
    setLoading(true);
    
    setTimeout(() => {
      try {
        localStorage.setItem('voiceassist-settings', JSON.stringify(settings));
        
        // Apply monitor mode settings
        setMonitorMode(
          settings.monitorMode || false, 
          settings.monitorDevice || undefined
        );
        
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated successfully.",
        });
      } catch (error) {
        console.error('Error saving settings:', error);
        
        toast({
          title: "Error saving settings",
          description: "There was a problem saving your preferences.",
          variant: "destructive",
        });
      }
      
      setLoading(false);
    }, 500);
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    // Turn off monitor mode
    setMonitorMode(false);
    
    setSettings({
      theme: 'light',
      language: 'en-US',
      audioInputDevice: audioDevices.length > 0 ? audioDevices[0].deviceId : '',
      audioOutputDevice: '',
      transcriptionEnabled: true,
      aiModel: 'auto',
      privacyMode: false,
      monitorMode: false,
      monitorDevice: '',
      hotkeys: {
        startRecording: 'Ctrl+R',
        stopRecording: 'Ctrl+S',
        replayLastMinute: 'Ctrl+P',
        toggleSpeaker: 'Ctrl+T'
      }
    });
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults.",
    });
  };
  
  // Use state variable to manage active tab
  const renderTabContent = () => {
    switch(tab) {
      case 'general':
        return (
          <div className="mt-0">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value: 'light' | 'dark' | 'system') => 
                    setSettings(prev => ({ ...prev, theme: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        <Laptop className="h-4 w-4 mr-2" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        English (US)
                      </div>
                    </SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                    <SelectItem value="fr-FR">Français</SelectItem>
                    <SelectItem value="de-DE">Deutsch</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aiModel">AI Model</Label>
                <Select
                  value={settings.aiModel}
                  onValueChange={(value: 'chatgpt' | 'gemini' | 'claude' | 'auto') => 
                    setSettings(prev => ({ ...prev, aiModel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (recommended)</SelectItem>
                    <SelectItem value="chatgpt">ChatGPT</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Auto mode will choose the best model based on the task
                </p>
              </div>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="mt-0">
            <h2 className="text-xl font-semibold mb-4">Audio Settings</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-blue-800 font-medium">Audio Routing</h3>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  To use this app with Microsoft Teams, you'll need an external audio routing tool like VB-Audio Virtual Cable to create virtual audio devices that can be selected in Teams.
                </p>
                <div className="mt-2">
                  <Button variant="link" className="text-blue-600 p-0 h-auto text-sm" onClick={() => window.open('https://vb-audio.com/Cable/', '_blank')}>
                    Learn more about VB-Audio Virtual Cable
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioInput">Input Device (Microphone)</Label>
                <Select
                  value={settings.audioInputDevice}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, audioInputDevice: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioDevices
                      .filter(device => device.kind === 'audioinput')
                      .map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          <div className="flex items-center">
                            <Mic className="h-4 w-4 mr-2" />
                            {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This is the microphone that will be used to record your voice
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audioOutput">Output Device (Speaker)</Label>
                <Select
                  value={settings.audioOutputDevice}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, audioOutputDevice: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">System Default</SelectItem>
                    {audioDevices
                      .filter(device => device.kind === 'audiooutput')
                      .map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          <div className="flex items-center">
                            <Volume2 className="h-4 w-4 mr-2" />
                            {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This is the speaker that will be used to play audio
                </p>
              </div>

              <Separator />
              
              <div className="space-y-2">
                <Label>Monitor Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="monitorMode" 
                    checked={settings.monitorMode}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, monitorMode: checked }))
                    }
                  />
                  <Label htmlFor="monitorMode">Listen for system audio</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, the app will try to capture audio coming from your computer's speakers (useful for transcribing Teams calls)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monitorDevice">Audio Monitor Source</Label>
                <Select
                  value={settings.monitorDevice || ''}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, monitorDevice: value }))
                  }
                  disabled={!settings.monitorMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audio source to monitor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default System Audio</SelectItem>
                    {audioDevices
                      .filter(device => device.kind === 'audioinput')
                      .map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          <div className="flex items-center">
                            <Volume2 className="h-4 w-4 mr-2" />
                            {device.label || `Device ${device.deviceId.slice(0, 5)}`}
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select a device that will capture the audio you want to monitor (e.g., a virtual audio cable output)
                </p>
              </div>
              
              <div className="space-y-4">
                <Button onClick={() => {
                  getAudioDevices().then(devices => {
                    setAudioDevices(devices);
                    toast({
                      title: "Devices refreshed",
                      description: `Found ${devices.length} audio devices.`,
                    });
                  });
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Devices
                </Button>
                
                {/* Audio monitor visualization */}
                {settings.monitorMode && (
                  <div>
                    <Label>Audio Monitor Visualization</Label>
                    <AudioMonitor className="mt-2 h-24" />
                  </div>
                )}
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-medium">Quick Tip:</p>
                  <p>For Microsoft Teams calls, you can use third-party tools like VB-Audio Virtual Cable to:</p>
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Set up a virtual cable as your speaker in Teams</li>
                    <li>Select that same virtual cable as your monitor source here</li>
                    <li>Make sure Monitor Mode is enabled above</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );
      case 'transcription':
        return (
          <div className="mt-0">
            <h2 className="text-xl font-semibold mb-4">Transcription Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="transcriptionEnabled">Enable Transcription</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically transcribe speech to text
                  </p>
                </div>
                <Switch
                  id="transcriptionEnabled"
                  checked={settings.transcriptionEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, transcriptionEnabled: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Speaker Diarization</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Automatically identify different speakers in the conversation
                </p>
                
                <div className="pl-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="speakerDiarization" defaultChecked />
                    <Label htmlFor="speakerDiarization">Enable speaker detection</Label>
                  </div>
                  
                  <Input 
                    placeholder="Your name (for user speaker)"
                    defaultValue="You" 
                    className="max-w-xs"
                  />
                  <Input 
                    placeholder="Other speaker name"
                    defaultValue="Interviewer" 
                    className="max-w-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="mt-0">
            <h2 className="text-xl font-semibold mb-4">About VoiceAssist AI</h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-primary-500 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm0-12a2 2 0 0 1 2 2v5a2 2 0 1 1-4 0V5a2 2 0 0 1 2-2Zm4 16.5a1 1 0 0 1-.7-.3A7.8 7.8 0 0 0 12 18a7.8 7.8 0 0 0-3.3 1.2 1 1 0 0 1-1.4-1.4A9.9 9.9 0 0 1 12 16a9.9 9.9 0 0 1 4.7 1.8 1 1 0 0 1 .3.7 1 1 0 0 1-1 1Z" />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">VoiceAssist AI</h3>
                  <p className="text-sm text-gray-600">Version 1.0.0</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  VoiceAssist AI is a cross-platform, real-time voice assistant that records, transcribes, summarizes, and analyzes conversations using AI.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-gray-600">
                  <Info className="h-4 w-4 mr-2" />
                  Help & Documentation
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="mt-0">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p>Please select a settings category from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure your voice assistant preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <div className="flex flex-col items-start space-y-1 w-full">
                  <button 
                    onClick={() => setTab("general")}
                    className={`w-full text-left px-3 py-2 rounded-md ${tab === "general" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    General
                  </button>
                  <button 
                    onClick={() => setTab("audio")}
                    className={`w-full text-left px-3 py-2 rounded-md ${tab === "audio" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Audio
                  </button>
                  <button 
                    onClick={() => setTab("transcription")}
                    className={`w-full text-left px-3 py-2 rounded-md ${tab === "transcription" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Transcription
                  </button>
                  <button 
                    onClick={() => setTab("about")}
                    className={`w-full text-left px-3 py-2 rounded-md ${tab === "about" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    About
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-3/4">
          <Card>
            <CardContent className="p-6">
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-end mt-6 space-x-2">
        <Button variant="outline" onClick={resetSettings}>
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}