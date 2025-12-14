// Drip Trigger Configuration Modal

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DripTrigger, DripTriggerType, DelayUnit } from "./types";
import { Clock, CalendarClock, AlertCircle, Hand, Mail } from "lucide-react";

interface DripTriggerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: DripTrigger;
  allowedTriggers: DripTriggerType[];
  onSave: (trigger: DripTrigger) => void;
}

const triggerOptions: { type: DripTriggerType; label: string; description: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'on_entry', label: 'On Entry', description: 'When lead enters this stage', icon: Mail },
  { type: 'after_delay', label: 'After Delay', description: 'After X minutes/hours/days', icon: Clock },
  { type: 'at_datetime', label: 'At Date/Time', description: 'At a specific date and time', icon: CalendarClock },
  { type: 'on_condition', label: 'On Condition', description: 'Based on lead condition', icon: AlertCircle },
  { type: 'manual_only', label: 'Manual Only', description: 'Manually triggered by user', icon: Hand },
];

export function DripTriggerModal({
  open,
  onOpenChange,
  trigger,
  allowedTriggers,
  onSave,
}: DripTriggerModalProps) {
  const [localTrigger, setLocalTrigger] = useState<DripTrigger>(trigger);

  useEffect(() => {
    setLocalTrigger(trigger);
  }, [trigger, open]);

  const handleSave = () => {
    onSave(localTrigger);
    onOpenChange(false);
  };

  const filteredOptions = triggerOptions.filter(opt => allowedTriggers.includes(opt.type));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Drip Trigger</DialogTitle>
          <DialogDescription>
            Set when this step should be executed in the sequence.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Trigger Type Selection */}
          <div className="space-y-3">
            <Label>Trigger Type</Label>
            <RadioGroup
              value={localTrigger.type}
              onValueChange={(value) => setLocalTrigger({ type: value as DripTriggerType })}
              className="space-y-2"
            >
              {filteredOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.type}
                    className={`flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                      localTrigger.type === option.type ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setLocalTrigger({ type: option.type })}
                  >
                    <RadioGroupItem value={option.type} id={option.type} />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label htmlFor={option.type} className="cursor-pointer font-medium">
                        {option.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Delay Configuration */}
          {localTrigger.type === 'after_delay' && (
            <div className="space-y-3 border-t pt-4">
              <Label>Delay Duration</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={localTrigger.delayValue || 1}
                  onChange={(e) => setLocalTrigger({
                    ...localTrigger,
                    delayValue: parseInt(e.target.value) || 1,
                  })}
                  className="w-24"
                />
                <Select
                  value={localTrigger.delayUnit || 'hours'}
                  onValueChange={(value: DelayUnit) => setLocalTrigger({
                    ...localTrigger,
                    delayUnit: value,
                  })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* DateTime Configuration */}
          {localTrigger.type === 'at_datetime' && (
            <div className="space-y-3 border-t pt-4">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={localTrigger.datetime || ''}
                onChange={(e) => setLocalTrigger({
                  ...localTrigger,
                  datetime: e.target.value,
                })}
              />
              <p className="text-xs text-muted-foreground">
                For recurring events (birthdays, anniversaries), the system will match this pattern annually.
              </p>
            </div>
          )}

          {/* Condition Configuration */}
          {localTrigger.type === 'on_condition' && (
            <div className="space-y-3 border-t pt-4">
              <Label>Condition</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={localTrigger.condition?.field || 'lead_score'}
                  onValueChange={(value) => setLocalTrigger({
                    ...localTrigger,
                    condition: {
                      field: value,
                      operator: localTrigger.condition?.operator || '=',
                      value: localTrigger.condition?.value || '',
                    },
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="lead_score">Lead Score</SelectItem>
                    <SelectItem value="tour_completed">Tour Completed</SelectItem>
                    <SelectItem value="has_replied">Has Replied</SelectItem>
                    <SelectItem value="no_response">No Response</SelectItem>
                    <SelectItem value="days_since_contact">Days Since Contact</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={localTrigger.condition?.operator || '='}
                  onValueChange={(value) => setLocalTrigger({
                    ...localTrigger,
                    condition: {
                      field: localTrigger.condition?.field || 'lead_score',
                      operator: value,
                      value: localTrigger.condition?.value || '',
                    },
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="=">=</SelectItem>
                    <SelectItem value="!=">≠</SelectItem>
                    <SelectItem value=">">{">"}</SelectItem>
                    <SelectItem value="<">{"<"}</SelectItem>
                    <SelectItem value=">=">{">="}</SelectItem>
                    <SelectItem value="<=">{"<="}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={localTrigger.condition?.value || ''}
                  onChange={(e) => setLocalTrigger({
                    ...localTrigger,
                    condition: {
                      field: localTrigger.condition?.field || 'lead_score',
                      operator: localTrigger.condition?.operator || '=',
                      value: e.target.value,
                    },
                  })}
                  placeholder="Value"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="crm-gradient-primary">
            Save Trigger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
