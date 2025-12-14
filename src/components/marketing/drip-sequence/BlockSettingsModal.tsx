// Block Settings Modal

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DripBlock, BlockType } from "./types";

interface BlockSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: DripBlock | null;
  onSave: (updates: Partial<DripBlock> & { 
    settings?: BlockSettings 
  }) => void;
}

export interface BlockSettings {
  triggerMode: 'automated' | 'manual' | 'hybrid';
  allowManualInitiation: boolean;
  allowMultipleRuns: boolean;
  cooldownPeriod: number; // in hours
  cooldownEnabled: boolean;
}

const blockTypeLabels: Record<BlockType | 'custom', string> = {
  'lead-journey': 'Lead Journey',
  'community-message': 'Community Message',
  'reminders': 'Reminders',
  'wishes': 'Wishes',
  'custom': 'Custom',
};

export function BlockSettingsModal({ open, onOpenChange, block, onSave }: BlockSettingsModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [triggerMode, setTriggerMode] = useState<'automated' | 'manual' | 'hybrid'>('automated');
  const [allowManualInitiation, setAllowManualInitiation] = useState(true);
  const [allowMultipleRuns, setAllowMultipleRuns] = useState(false);
  const [cooldownEnabled, setCooldownEnabled] = useState(false);
  const [cooldownPeriod, setCooldownPeriod] = useState(24);

  // Load block data when modal opens
  useEffect(() => {
    if (block && open) {
      setName(block.name);
      setDescription(block.description);
      setIsActive(block.isActive);
      // Default settings - in a real app, these would be stored in block
      setTriggerMode(block.type === 'community-message' ? 'manual' : 'automated');
      setAllowManualInitiation(true);
      setAllowMultipleRuns(false);
      setCooldownEnabled(false);
      setCooldownPeriod(24);
    }
  }, [block, open]);

  const handleSave = () => {
    if (!block) return;
    
    onSave({
      name: name.trim() || block.name,
      description: description.trim(),
      isActive,
      settings: {
        triggerMode,
        allowManualInitiation,
        allowMultipleRuns,
        cooldownPeriod,
        cooldownEnabled,
      },
    });
    
    onOpenChange(false);
  };

  if (!block) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Block Settings</DialogTitle>
          <DialogDescription>
            Configure how this block behaves and executes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* General Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">General</h4>
            
            <div className="space-y-2">
              <Label htmlFor="settings-name">Block Name</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-description">Description</Label>
              <Textarea
                id="settings-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Block Status</Label>
                <p className="text-xs text-muted-foreground">
                  {isActive ? "Block is active and processing" : "Block is paused"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : ""}>
                  {isActive ? "Active" : "Paused"}
                </Badge>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Block Type</Label>
                <p className="text-xs text-muted-foreground">
                  Cannot be changed after creation
                </p>
              </div>
              <Badge variant="outline">
                {blockTypeLabels[block.type] || block.type}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Trigger Mode Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Trigger Mode</h4>
            
            <div className="space-y-2">
              <Label>Default Trigger Mode</Label>
              <Select value={triggerMode} onValueChange={(v) => setTriggerMode(v as 'automated' | 'manual' | 'hybrid')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automated">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Automated</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="manual">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Manual</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>Hybrid</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {triggerMode === 'automated' && "Steps execute automatically based on configured triggers"}
                {triggerMode === 'manual' && "All steps require manual initiation to run"}
                {triggerMode === 'hybrid' && "Mix of automated and manually triggered steps"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Execution Rules Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Execution Rules</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Manual Initiation</Label>
                <p className="text-xs text-muted-foreground">
                  Enable the Run Trigger button for this block
                </p>
              </div>
              <Switch 
                checked={allowManualInitiation} 
                onCheckedChange={setAllowManualInitiation} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Multiple Runs</Label>
                <p className="text-xs text-muted-foreground">
                  Allow same customer to enter block multiple times
                </p>
              </div>
              <Switch 
                checked={allowMultipleRuns} 
                onCheckedChange={setAllowMultipleRuns} 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cooldown Period</Label>
                  <p className="text-xs text-muted-foreground">
                    Minimum wait time between runs for same customer
                  </p>
                </div>
                <Switch 
                  checked={cooldownEnabled} 
                  onCheckedChange={setCooldownEnabled} 
                />
              </div>
              {cooldownEnabled && (
                <div className="flex items-center gap-2 pl-4">
                  <Input
                    type="number"
                    min={1}
                    max={720}
                    value={cooldownPeriod}
                    onChange={(e) => setCooldownPeriod(parseInt(e.target.value) || 24)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
