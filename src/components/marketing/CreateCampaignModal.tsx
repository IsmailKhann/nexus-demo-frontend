import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Mail, MessageSquare, Globe, Users, Megaphone, DollarSign, Target } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { segments, templates, type Campaign, type CampaignEvent } from "@/data/marketing";

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCampaign: (campaign: Campaign, events: CampaignEvent[]) => void;
}

const channelOptions = [
  { value: "Email", label: "Email", icon: Mail },
  { value: "SMS", label: "SMS", icon: MessageSquare },
  { value: "PPC", label: "PPC / Google Ads", icon: Globe },
  { value: "Social", label: "Social Media", icon: Users },
  { value: "ILS", label: "ILS Listing", icon: Globe },
  { value: "Referral", label: "Referral Program", icon: Users },
  { value: "Event", label: "Event / Open House", icon: Megaphone },
];

export function CreateCampaignModal({ open, onOpenChange, onCreateCampaign }: CreateCampaignModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('Email');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [sendTime, setSendTime] = useState('09:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [scheduleImmediate, setScheduleImmediate] = useState(false);

  const resetForm = () => {
    setName('');
    setChannel('Email');
    setBudget('');
    setStartDate(undefined);
    setEndDate(undefined);
    setUtmSource('');
    setUtmMedium('');
    setUtmCampaign('');
    setSegmentId('');
    setTemplateId('');
    setSendTime('09:00');
    setIsRecurring(false);
    setScheduleImmediate(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Campaign name is required", variant: "destructive" });
      return;
    }
    if (!startDate) {
      toast({ title: "Error", description: "Start date is required", variant: "destructive" });
      return;
    }

    const now = new Date().toISOString();
    const campaignId = `CMP_${Date.now()}`;
    
    const newCampaign: Campaign = {
      id: campaignId,
      name: name,
      channel: channel,
      budget: parseFloat(budget) || 0,
      spend_to_date: 0,
      leads_generated: 0,
      roi_percent: 0,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate ? endDate.toISOString().split('T')[0] : '',
      utm_source: utmSource || name.toLowerCase().replace(/\s+/g, '_'),
      utm_medium: utmMedium || channel.toLowerCase(),
      utm_campaign: utmCampaign || name.toLowerCase().replace(/\s+/g, '_'),
      created_by_user_id: 'USR_003',
      status: scheduleImmediate ? 'Active' : 'Scheduled',
      created_at: now,
      updated_at: now,
    };

    // Create campaign events for email/SMS campaigns
    const events: CampaignEvent[] = [];
    if ((channel === 'Email' || channel === 'SMS') && segmentId) {
      const eventId = `EVT_${Date.now()}`;
      const sendDateTime = scheduleImmediate 
        ? now 
        : `${startDate.toISOString().split('T')[0]}T${sendTime}:00Z`;
      
      events.push({
        id: eventId,
        campaign_id: campaignId,
        lead_id: '', // Will be populated per-lead when sending
        event_type: 'scheduled',
        timestamp: sendDateTime,
        metadata: JSON.stringify({
          template_id: templateId,
          segment_id: segmentId,
          status: 'scheduled',
        }),
      });
    }

    onCreateCampaign(newCampaign, events);
    
    toast({
      title: "Campaign Created",
      description: `${name} has been ${scheduleImmediate ? 'launched' : 'scheduled'} successfully.`,
    });

    handleClose();
  };

  const emailTemplates = templates.filter(t => t.type === 'email');
  const smsTemplates = templates.filter(t => t.type === 'sms');
  const availableTemplates = channel === 'SMS' ? smsTemplates : emailTemplates;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-crm-primary flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Create New Campaign
          </DialogTitle>
          <DialogDescription>
            Set up a new marketing campaign with targeting, scheduling, and templates
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Holiday Promo 2026"
                className="border-crm-border focus:ring-crm-primary"
              />
            </div>

            <div className="space-y-2">
              <Label>Channel</Label>
              <div className="grid grid-cols-4 gap-2">
                {channelOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setChannel(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 border rounded-lg transition-all",
                      channel === option.value
                        ? "border-crm-primary bg-crm-primary/10 text-crm-primary"
                        : "border-crm-border hover:border-crm-primary/50"
                    )}
                  >
                    <option.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-crm-text-muted" />
                  <Input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="5000"
                    className="pl-9 border-crm-border focus:ring-crm-primary"
                  />
                </div>
              </div>
              {(channel === 'Email' || channel === 'SMS') && (
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger className="border-crm-border">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map((tmpl) => (
                        <SelectItem key={tmpl.id} value={tmpl.id}>
                          {tmpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-crm-text-secondary text-sm">UTM Parameters (optional)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="utm_source"
                  className="text-sm border-crm-border"
                />
                <Input
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="utm_medium"
                  className="text-sm border-crm-border"
                />
                <Input
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="utm_campaign"
                  className="text-sm border-crm-border"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Segment
              </Label>
              <Select value={segmentId} onValueChange={setSegmentId}>
                <SelectTrigger className="border-crm-border">
                  <SelectValue placeholder="Select audience segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((seg) => (
                    <SelectItem key={seg.id} value={seg.id}>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{seg.type}</Badge>
                        {seg.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {segmentId && (
              <div className="p-4 bg-crm-column rounded-lg border border-crm-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-crm-text">
                      {segments.find(s => s.id === segmentId)?.name}
                    </p>
                    <p className="text-sm text-crm-text-secondary">
                      Filter: {segments.find(s => s.id === segmentId)?.filter_json}
                    </p>
                  </div>
                  <Badge className="bg-crm-primary text-white">
                    ~150 leads
                  </Badge>
                </div>
              </div>
            )}

            <div className="p-4 border border-dashed border-crm-border rounded-lg text-center">
              <p className="text-sm text-crm-text-muted">
                Or upload a CSV with lead IDs
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Upload CSV
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-crm-border",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-crm-border",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {(channel === 'Email' || channel === 'SMS') && (
              <div className="space-y-2">
                <Label>Send Time</Label>
                <Input
                  type="time"
                  value={sendTime}
                  onChange={(e) => setSendTime(e.target.value)}
                  className="border-crm-border w-40"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-crm-column rounded-lg border border-crm-border">
              <div>
                <p className="font-medium text-crm-text">Launch Immediately</p>
                <p className="text-sm text-crm-text-secondary">
                  Start the campaign as soon as it's created
                </p>
              </div>
              <Switch
                checked={scheduleImmediate}
                onCheckedChange={setScheduleImmediate}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-crm-column rounded-lg border border-crm-border">
              <div>
                <p className="font-medium text-crm-text">Recurring Campaign</p>
                <p className="text-sm text-crm-text-secondary">
                  Repeat this campaign on a schedule
                </p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-crm-border">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-crm-primary hover:bg-crm-primary-hover text-white">
            {scheduleImmediate ? 'Launch Campaign' : 'Schedule Campaign'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
