// Automation Settings Modal
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Info } from "lucide-react";

export interface AutomationSettings {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Paused' | 'Draft';
  triggerMode: 'automated' | 'manual' | 'hybrid';
  allowManualRun: boolean;
  allowMultipleRuns: boolean;
  cooldownPeriod: number; // in hours
}

interface AutomationSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: AutomationSettings | null;
  onSave: (settings: Partial<AutomationSettings>) => void;
}

export function AutomationSettingsModal({ 
  open, 
  onOpenChange, 
  automation,
  onSave 
}: AutomationSettingsModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<'Active' | 'Paused' | 'Draft'>('Active');
  const [allowManualRun, setAllowManualRun] = useState(true);
  const [allowMultipleRuns, setAllowMultipleRuns] = useState(false);
  const [cooldownPeriod, setCooldownPeriod] = useState(24);

  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setDescription(automation.description || "");
      setStatus(automation.status);
      setAllowManualRun(automation.allowManualRun ?? true);
      setAllowMultipleRuns(automation.allowMultipleRuns ?? false);
      setCooldownPeriod(automation.cooldownPeriod ?? 24);
    }
  }, [automation]);

  const handleSave = () => {
    onSave({
      name,
      description,
      status,
      allowManualRun,
      allowMultipleRuns,
      cooldownPeriod,
    });
    onOpenChange(false);
  };

  if (!automation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Automation Settings
          </DialogTitle>
          <DialogDescription>
            Configure how this automation behaves and executes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* General Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              General
              <Badge variant="outline" className="text-xs">
                {automation.triggerMode}
              </Badge>
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="name">Automation Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter automation name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this automation does..."
                className="h-20"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'Active' | 'Paused' | 'Draft')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trigger Mode</Label>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="capitalize">{automation.triggerMode}</span>
                <span className="text-xs">(read-only after creation)</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Execution Rules */}
          <div className="space-y-4">
            <h4 className="font-medium">Execution Rules</h4>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Manual Run</Label>
                <p className="text-xs text-muted-foreground">
                  Can be triggered manually by users
                </p>
              </div>
              <Switch
                checked={allowManualRun}
                onCheckedChange={setAllowManualRun}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Multiple Runs on Same Lead</Label>
                <p className="text-xs text-muted-foreground">
                  Lead can be enrolled multiple times
                </p>
              </div>
              <Switch
                checked={allowMultipleRuns}
                onCheckedChange={setAllowMultipleRuns}
              />
            </div>

            <div className="space-y-2">
              <Label>Cooldown Period (hours)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Minimum time between runs for the same lead
              </p>
              <Input
                type="number"
                min={0}
                max={720}
                value={cooldownPeriod}
                onChange={(e) => setCooldownPeriod(parseInt(e.target.value) || 0)}
                className="w-32"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
