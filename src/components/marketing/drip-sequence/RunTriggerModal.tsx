// Run Trigger Modal - Microsoft Teams-style scheduling

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Play, Calendar, Clock, Users, RepeatIcon, 
  CheckCircle2, AlertCircle 
} from "lucide-react";
import { DripBlock } from "./types";

interface RunTriggerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: DripBlock | null;
  onRunTrigger: (config: TriggerRunConfig) => void;
}

export interface TriggerRunConfig {
  mode: 'once' | 'series';
  // Once mode
  runDate?: string;
  runTime?: string;
  // Series mode
  startDate?: string;
  endDate?: string;
  hasEndDate?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  customInterval?: number;
  customUnit?: 'days' | 'weeks' | 'months';
  // Common
  audienceType: 'all' | 'segment' | 'custom';
  audienceSegment?: string;
  runImmediately?: boolean;
}

// Mock audience segments
const mockSegments = [
  { id: 'seg_new', name: 'New Leads', count: 45 },
  { id: 'seg_active', name: 'Active Prospects', count: 128 },
  { id: 'seg_residents', name: 'Current Residents', count: 312 },
  { id: 'seg_expiring', name: 'Expiring Leases', count: 23 },
];

export function RunTriggerModal({ open, onOpenChange, block, onRunTrigger }: RunTriggerModalProps) {
  const [mode, setMode] = useState<'once' | 'series'>('once');
  const [runDate, setRunDate] = useState(new Date().toISOString().split('T')[0]);
  const [runTime, setRunTime] = useState("09:00");
  const [runImmediately, setRunImmediately] = useState(false);
  
  // Series options
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState("");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>('days');
  
  // Audience
  const [audienceType, setAudienceType] = useState<'all' | 'segment' | 'custom'>('all');
  const [audienceSegment, setAudienceSegment] = useState('');

  const handleRun = () => {
    if (!block) return;
    
    onRunTrigger({
      mode,
      runDate: mode === 'once' ? runDate : undefined,
      runTime: mode === 'once' ? runTime : undefined,
      startDate: mode === 'series' ? startDate : undefined,
      endDate: mode === 'series' && hasEndDate ? endDate : undefined,
      hasEndDate,
      frequency: mode === 'series' ? frequency : undefined,
      customInterval: frequency === 'custom' ? customInterval : undefined,
      customUnit: frequency === 'custom' ? customUnit : undefined,
      audienceType,
      audienceSegment: audienceType === 'segment' ? audienceSegment : undefined,
      runImmediately,
    });
    
    onOpenChange(false);
  };

  const getFrequencyDescription = () => {
    if (mode !== 'series') return '';
    
    let desc = 'This will run ';
    switch (frequency) {
      case 'daily':
        desc += 'every day';
        break;
      case 'weekly':
        desc += 'every week';
        break;
      case 'monthly':
        desc += 'every month';
        break;
      case 'custom':
        desc += `every ${customInterval} ${customUnit}`;
        break;
    }
    
    if (hasEndDate && endDate) {
      desc += ` until ${new Date(endDate).toLocaleDateString()}`;
    } else {
      desc += ' (no end date)';
    }
    
    return desc;
  };

  const getAudienceCount = () => {
    if (audienceType === 'all') return 508; // Mock total
    if (audienceType === 'segment' && audienceSegment) {
      return mockSegments.find(s => s.id === audienceSegment)?.count || 0;
    }
    return 0;
  };

  if (!block) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Run Trigger
          </DialogTitle>
          <DialogDescription>
            Schedule when to run "{block.name}" for selected audience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Mode Selection */}
          <div className="space-y-3">
            <Label>Trigger Mode</Label>
            <RadioGroup 
              value={mode} 
              onValueChange={(v) => setMode(v as 'once' | 'series')}
              className="grid grid-cols-2 gap-3"
            >
              <Card 
                className={`p-4 cursor-pointer transition-all ${mode === 'once' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                onClick={() => setMode('once')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="once" id="mode-once" />
                  <div>
                    <Label htmlFor="mode-once" className="cursor-pointer font-medium">
                      Run Once
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Execute a single time at specified date/time
                    </p>
                  </div>
                </div>
              </Card>
              <Card 
                className={`p-4 cursor-pointer transition-all ${mode === 'series' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                onClick={() => setMode('series')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="series" id="mode-series" />
                  <div>
                    <Label htmlFor="mode-series" className="cursor-pointer font-medium">
                      Run as Series
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Repeat execution on a schedule
                    </p>
                  </div>
                </div>
              </Card>
            </RadioGroup>
          </div>

          <Separator />

          {/* Run Once Options */}
          {mode === 'once' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Run Immediately</Label>
                  <p className="text-xs text-muted-foreground">
                    Start execution right away
                  </p>
                </div>
                <Switch 
                  checked={runImmediately} 
                  onCheckedChange={setRunImmediately} 
                />
              </div>

              {!runImmediately && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={runDate}
                      onChange={(e) => setRunDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Time
                    </Label>
                    <Input
                      type="time"
                      value={runTime}
                      onChange={(e) => setRunTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Run as Series Options */}
          {mode === 'series' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <RepeatIcon className="h-4 w-4 text-muted-foreground" />
                  Frequency
                </Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as 'daily' | 'weekly' | 'monthly' | 'custom')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {frequency === 'custom' && (
                <div className="flex items-center gap-2 pl-4">
                  <span className="text-sm text-muted-foreground">Every</span>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={customInterval}
                    onChange={(e) => setCustomInterval(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Select value={customUnit} onValueChange={(v) => setCustomUnit(v as 'days' | 'weeks' | 'months')}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">days</SelectItem>
                      <SelectItem value="weeks">weeks</SelectItem>
                      <SelectItem value="months">months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Set End Date</Label>
                  <Switch 
                    checked={hasEndDate} 
                    onCheckedChange={setHasEndDate} 
                  />
                </div>
                {hasEndDate && (
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                )}
              </div>

              {/* Series Preview */}
              <Card className="p-3 bg-muted/50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {getFrequencyDescription()}
                  </p>
                </div>
              </Card>
            </div>
          )}

          <Separator />

          {/* Audience Selection */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Target Audience
            </Label>
            
            <RadioGroup 
              value={audienceType} 
              onValueChange={(v) => setAudienceType(v as 'all' | 'segment' | 'custom')}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="aud-all" />
                <Label htmlFor="aud-all" className="cursor-pointer">
                  All Customers
                </Label>
                <Badge variant="outline" className="ml-auto">508</Badge>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="segment" id="aud-segment" />
                <Label htmlFor="aud-segment" className="cursor-pointer">
                  Specific Segment
                </Label>
              </div>
            </RadioGroup>

            {audienceType === 'segment' && (
              <Select value={audienceSegment} onValueChange={setAudienceSegment}>
                <SelectTrigger className="ml-6">
                  <SelectValue placeholder="Select segment..." />
                </SelectTrigger>
                <SelectContent>
                  {mockSegments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{segment.name}</span>
                        <Badge variant="outline">{segment.count}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-auto">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {mode === 'once' 
                ? runImmediately 
                  ? 'Will run immediately' 
                  : `Scheduled for ${new Date(runDate).toLocaleDateString()} at ${runTime}`
                : 'Series configured'
              }
            </span>
            {audienceType !== 'custom' && (
              <Badge variant="secondary">{getAudienceCount()} recipients</Badge>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRun} className="gap-2">
            <Play className="h-4 w-4" />
            {mode === 'once' && runImmediately ? 'Run Now' : mode === 'once' ? 'Schedule' : 'Create Series'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
