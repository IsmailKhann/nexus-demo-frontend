// Create Block Modal

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Route, Megaphone, Bell, Gift, Sparkles } from "lucide-react";
import { BlockType } from "./types";

interface CreateBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBlock: (block: {
    name: string;
    type: BlockType | 'custom';
    description: string;
    triggerMode: 'automated' | 'manual' | 'hybrid';
  }) => void;
}

const blockTypeOptions = [
  { value: 'lead-journey', label: 'Lead Journey', icon: Route, color: 'text-blue-600' },
  { value: 'community-message', label: 'Community Message', icon: Megaphone, color: 'text-purple-600' },
  { value: 'reminders', label: 'Reminder', icon: Bell, color: 'text-amber-600' },
  { value: 'wishes', label: 'Wishes', icon: Gift, color: 'text-pink-600' },
  { value: 'custom', label: 'Custom', icon: Sparkles, color: 'text-primary' },
];

export function CreateBlockModal({ open, onOpenChange, onCreateBlock }: CreateBlockModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<BlockType | 'custom'>('lead-journey');
  const [description, setDescription] = useState("");
  const [triggerMode, setTriggerMode] = useState<'automated' | 'manual' | 'hybrid'>('automated');

  const handleCreate = () => {
    if (!name.trim()) return;
    
    onCreateBlock({
      name: name.trim(),
      type,
      description: description.trim(),
      triggerMode,
    });

    // Reset form
    setName("");
    setType('lead-journey');
    setDescription("");
    setTriggerMode('automated');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Block</DialogTitle>
          <DialogDescription>
            Create a new journey block to automate customer communications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="block-name">Block Name *</Label>
            <Input
              id="block-name"
              placeholder="e.g., VIP Customer Journey"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-type">Block Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as BlockType | 'custom')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {blockTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className={`h-4 w-4 ${option.color}`} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-description">Description (optional)</Label>
            <Textarea
              id="block-description"
              placeholder="Describe the purpose of this journey block..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger-mode">Default Trigger Mode</Label>
            <Select value={triggerMode} onValueChange={(v) => setTriggerMode(v as 'automated' | 'manual' | 'hybrid')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automated">
                  <div className="flex flex-col">
                    <span>Automated</span>
                    <span className="text-xs text-muted-foreground">Steps run automatically based on triggers</span>
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div className="flex flex-col">
                    <span>Manual</span>
                    <span className="text-xs text-muted-foreground">Steps require manual initiation</span>
                  </div>
                </SelectItem>
                <SelectItem value="hybrid">
                  <div className="flex flex-col">
                    <span>Hybrid</span>
                    <span className="text-xs text-muted-foreground">Mix of automated and manual steps</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
