import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, User, Upload, Mic, Play, Pause, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { properties, leadSources, users, type MarketingLead, type LeadInteraction } from "@/data/marketing";

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLead: (lead: MarketingLead, interaction?: LeadInteraction) => void;
}

const channelOptions = [
  { value: "Phone", label: "Phone Call", icon: Phone, description: "Create from incoming/outgoing call" },
  { value: "SMS", label: "SMS", icon: MessageSquare, description: "Create from text message" },
  { value: "Email", label: "Email", icon: Mail, description: "Create from email inquiry" },
  { value: "Manual", label: "Manual Entry", icon: User, description: "Manually enter lead details" },
];

export function AddLeadModal({ open, onOpenChange, onAddLead }: AddLeadModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'channel' | 'details'>('channel');
  const [channel, setChannel] = useState<string>('');
  const [callDirection, setCallDirection] = useState<'Inbound' | 'Outbound' | 'Missed'>('Inbound');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcribe, setTranscribe] = useState(false);
  
  // Lead form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('Medium');

  const resetForm = () => {
    setStep('channel');
    setChannel('');
    setCallDirection('Inbound');
    setAudioFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl('');
    setIsPlaying(false);
    setTranscribe(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPropertyId('');
    setSourceId('');
    setNotes('');
    setPriority('Medium');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleChannelSelect = (selectedChannel: string) => {
    setChannel(selectedChannel);
    // Auto-set source based on channel
    if (selectedChannel === 'Phone') {
      setSourceId('SRC_010'); // Cold Call
    } else if (selectedChannel === 'Email') {
      setSourceId('SRC_002'); // Website
    } else if (selectedChannel === 'SMS') {
      setSourceId('SRC_002'); // Website
    }
    setStep('details');
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl('');
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    const audio = document.getElementById('preview-audio') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSubmit = () => {
    if (!firstName.trim()) {
      toast({ title: "Error", description: "First name is required", variant: "destructive" });
      return;
    }

    const now = new Date().toISOString();
    const leadId = `LEA_${Date.now()}`;
    
    // Determine original_channel based on channel selection
    let originalChannel = channel;
    if (channel === 'Phone') originalChannel = 'Call';
    if (channel === 'Manual') originalChannel = 'Walk-In';

    const newLead: MarketingLead = {
      id: leadId,
      external_ref: '',
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      email: email || '',
      phone: phone || '',
      country_code: '+1',
      preferred_contact_channel: channel === 'Manual' ? 'Email' : channel,
      preferred_language: 'English',
      preferred_contact_time: 'Anytime',
      property_id: propertyId || '',
      unit_id: '',
      beds: 0,
      baths: 0,
      min_rent: 0,
      max_rent: 0,
      desired_move_in_date: '',
      pets: false,
      notes: notes,
      status: 'New',
      status_reason: '',
      lost_reason: '',
      lead_score: 50,
      priority: priority,
      lead_owner_id: 'USR_001',
      team_id: 'TM_001',
      source_id: sourceId,
      campaign_id: '',
      original_channel: originalChannel,
      utm_source: leadSources.find(s => s.id === sourceId)?.name.toLowerCase() || '',
      utm_medium: '',
      utm_campaign: '',
      referrer_url: '',
      created_at: now,
      updated_at: now,
      first_contacted_at: '',
      last_contacted_at: '',
      last_inbound_at: channel !== 'Manual' ? now : '',
      last_outbound_at: '',
      converted_to_lease_at: '',
      deleted_at: '',
    };

    // Create interaction if this is a call with audio
    let interaction: LeadInteraction | undefined;
    if (channel === 'Phone') {
      const interactionId = `INT_${Date.now()}`;
      interaction = {
        id: interactionId,
        lead_id: leadId,
        type: 'Call',
        direction: callDirection,
        channel: 'Phone',
        thread_id: '',
        subject: callDirection === 'Missed' ? 'Missed Call' : 'Call Log',
        message_body: notes || (audioFile ? 'Voice recording attached' : `${callDirection} call`),
        channel_message_id: '',
        attachments: audioFile ? [{
          type: 'audio',
          filename: audioFile.name,
          url: audioUrl,
          mime_type: audioFile.type,
          duration: 0, // Would need audio duration detection
        }] : '',
        created_by_user_id: 'USR_001',
        created_by_source: 'CRM',
        timestamp: now,
        duration_seconds: 0,
        is_visible_to_resident: false,
        is_unread: false,
        assigned_to_user_id: 'USR_001',
      };
    }

    onAddLead(newLead, interaction);
    
    toast({
      title: "Lead Created",
      description: `${newLead.full_name} added successfully${audioFile ? ' with voice recording' : ''}.`,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-crm-primary">Add New Lead</DialogTitle>
          <DialogDescription>
            {step === 'channel' ? 'Select how this lead was acquired' : `Create lead from ${channel}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'channel' ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            {channelOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleChannelSelect(option.value)}
                className="flex flex-col items-center gap-3 p-6 border-2 border-crm-border rounded-lg hover:border-crm-primary hover:bg-crm-primary/5 transition-all"
              >
                <div className="h-12 w-12 rounded-full bg-crm-primary/10 flex items-center justify-center">
                  <option.icon className="h-6 w-6 text-crm-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-crm-text">{option.label}</p>
                  <p className="text-xs text-crm-text-secondary">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Phone-specific options */}
            {channel === 'Phone' && (
              <div className="space-y-4 p-4 bg-crm-column rounded-lg border border-crm-border">
                <div className="space-y-2">
                  <Label>Call Direction</Label>
                  <Select value={callDirection} onValueChange={(v) => setCallDirection(v as 'Inbound' | 'Outbound' | 'Missed')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inbound">Inbound Call</SelectItem>
                      <SelectItem value="Outbound">Outbound Call</SelectItem>
                      <SelectItem value="Missed">Missed Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Attach Call Recording (optional)
                  </Label>
                  {!audioFile ? (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-crm-border">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={togglePlayback}
                        className="h-10 w-10 rounded-full border-crm-primary text-crm-primary"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{audioFile.name}</p>
                        <p className="text-xs text-crm-text-muted">{(audioFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveAudio}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <audio id="preview-audio" src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                    </div>
                  )}
                </div>

                {audioFile && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="transcribe"
                      checked={transcribe}
                      onCheckedChange={(checked) => setTranscribe(!!checked)}
                    />
                    <Label htmlFor="transcribe" className="text-sm cursor-pointer">
                      Transcribe recording (AI)
                    </Label>
                  </div>
                )}
              </div>
            )}

            {/* Lead details form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="border-crm-border focus:ring-crm-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="border-crm-border focus:ring-crm-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="border-crm-border focus:ring-crm-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0100"
                  className="border-crm-border focus:ring-crm-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property Interest</Label>
                <Select value={propertyId} onValueChange={setPropertyId}>
                  <SelectTrigger className="border-crm-border">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lead Source</Label>
                <Select value={sourceId} onValueChange={setSourceId}>
                  <SelectTrigger className="border-crm-border">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{source.category}</Badge>
                          {source.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="border-crm-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes..."
                className="border-crm-border focus:ring-crm-primary"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('channel')}>
                Back
              </Button>
              <Button onClick={handleSubmit} className="bg-crm-primary hover:bg-crm-primary-hover text-white">
                Create Lead
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
