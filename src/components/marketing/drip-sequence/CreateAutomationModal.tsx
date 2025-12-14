// Create Automation Modal
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Route, Megaphone, Bell, Gift, Sparkles } from "lucide-react";
import { DripBlock } from "./types";

interface CreateAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: DripBlock[];
  onCreateAutomation: (config: {
    name: string;
    blockId: string;
    triggerMode: 'automated' | 'manual' | 'hybrid';
  }) => void;
}

const blockIcons: Record<string, any> = {
  'route': Route,
  'megaphone': Megaphone,
  'bell': Bell,
  'gift': Gift,
};

export function CreateAutomationModal({ 
  open, 
  onOpenChange, 
  blocks,
  onCreateAutomation 
}: CreateAutomationModalProps) {
  const [name, setName] = useState("");
  const [blockId, setBlockId] = useState("");
  const [triggerMode, setTriggerMode] = useState<'automated' | 'manual' | 'hybrid'>('automated');

  const selectedBlock = blocks.find(b => b.id === blockId);

  const handleCreate = () => {
    if (!name.trim() || !blockId) return;
    
    onCreateAutomation({
      name: name.trim(),
      blockId,
      triggerMode,
    });
    
    // Reset form
    setName("");
    setBlockId("");
    setTriggerMode('automated');
    onOpenChange(false);
  };

  const getBlockIcon = (icon: string) => {
    const Icon = blockIcons[icon] || Sparkles;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            New Automation
          </DialogTitle>
          <DialogDescription>
            Create a new automation from an existing Journey Block.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="automation-name">Automation Name</Label>
            <Input
              id="automation-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome Email Sequence"
            />
          </div>

          <div className="space-y-2">
            <Label>Select Journey Block</Label>
            <Select value={blockId} onValueChange={setBlockId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a block..." />
              </SelectTrigger>
              <SelectContent>
                {blocks.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    <div className="flex items-center gap-2">
                      {getBlockIcon(block.icon)}
                      <span>{block.name}</span>
                      <Badge variant="outline" className="ml-1 text-[10px]">
                        {block.steps.length} steps
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBlock && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedBlock.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Trigger Mode</Label>
            <Select 
              value={triggerMode} 
              onValueChange={(v) => setTriggerMode(v as 'automated' | 'manual' | 'hybrid')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automated">
                  <div className="flex flex-col">
                    <span>Automated</span>
                    <span className="text-xs text-muted-foreground">
                      Runs automatically on trigger events
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div className="flex flex-col">
                    <span>Manual</span>
                    <span className="text-xs text-muted-foreground">
                      Only runs when manually triggered
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="hybrid">
                  <div className="flex flex-col">
                    <span>Hybrid</span>
                    <span className="text-xs text-muted-foreground">
                      Supports both automatic and manual execution
                    </span>
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
          <Button 
            onClick={handleCreate}
            disabled={!name.trim() || !blockId}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Create Automation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
