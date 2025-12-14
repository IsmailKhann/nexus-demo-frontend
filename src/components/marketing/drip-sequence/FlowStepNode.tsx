// Flow Step Node Component

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Droplet, Mail, Clock, CalendarClock, AlertCircle, Hand, 
  MoreVertical, Copy, Trash2, Users, GripVertical, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowStep, DripTriggerType } from "./types";

const triggerLabels: Record<DripTriggerType, string> = {
  on_entry: 'On Entry',
  after_delay: 'After Delay',
  at_datetime: 'At Date/Time',
  on_condition: 'On Condition',
  manual_only: 'Manual Only',
};

const triggerIcons: Record<DripTriggerType, React.FC<{ className?: string }>> = {
  on_entry: Mail,
  after_delay: Clock,
  at_datetime: CalendarClock,
  on_condition: AlertCircle,
  manual_only: Hand,
};

interface FlowStepNodeProps {
  step: FlowStep;
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onOpenDripConfig: () => void;
  onToggleEnabled: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function FlowStepNode({
  step,
  index,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onOpenDripConfig,
  onToggleEnabled,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: FlowStepNodeProps) {
  const TriggerIcon = triggerIcons[step.trigger.type];

  const getTriggerDescription = () => {
    switch (step.trigger.type) {
      case 'on_entry':
        return 'When lead enters this stage';
      case 'after_delay':
        return `After ${step.trigger.delayValue || 0} ${step.trigger.delayUnit || 'hours'}`;
      case 'at_datetime':
        return step.trigger.datetime || 'At scheduled time';
      case 'on_condition':
        return step.trigger.condition ? 
          `When ${step.trigger.condition.field} ${step.trigger.condition.operator} ${step.trigger.condition.value}` : 
          'Based on condition';
      case 'manual_only':
        return 'Manual trigger only';
      default:
        return 'Configure trigger';
    }
  };

  return (
    <div className="relative group">
      {/* Connector Line */}
      {!isFirst && (
        <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border" />
      )}

      <div
        onClick={onSelect}
        className={cn(
          "border rounded-lg transition-all cursor-pointer",
          isSelected 
            ? "border-primary shadow-md ring-2 ring-primary/20 bg-primary/5" 
            : "hover:border-primary/50 bg-card",
          !step.isEnabled && "opacity-60"
        )}
      >
        {/* Drip Trigger Button - Always at top */}
        <div className="p-3 border-b bg-muted/30 rounded-t-lg">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 h-9"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDripConfig();
            }}
          >
            <Droplet className="h-4 w-4 text-primary" />
            <span className="font-medium">Drip:</span>
            <TriggerIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate flex-1 text-left">
              {getTriggerDescription()}
            </span>
          </Button>
        </div>

        {/* Step Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag Handle & Step Number */}
            <div className="flex flex-col items-center gap-1">
              <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold",
                step.isEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </div>
            </div>

            {/* Step Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{step.title}</h4>
                <Badge variant="outline" className="text-xs shrink-0">
                  {triggerLabels[step.trigger.type]}
                </Badge>
              </div>
              
              {step.subject && (
                <p className="text-xs text-muted-foreground truncate mb-1">
                  Subject: {step.subject}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground line-clamp-2">
                {step.body.substring(0, 100)}...
              </p>

              {/* Customer Count */}
              {step.customers.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {step.customers.filter(c => c.status === 'active').length} active, 
                    {step.customers.filter(c => c.status === 'completed').length} completed
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Reorder Buttons */}
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={isFirst}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp();
                  }}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={isLast}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown();
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Enable/Disable Toggle */}
              <Switch
                checked={step.isEnabled}
                onCheckedChange={() => onToggleEnabled()}
                onClick={(e) => e.stopPropagation()}
                className="scale-75"
              />

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Step
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Step
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Connector Line to next */}
      {!isLast && (
        <div className="absolute left-6 -bottom-4 w-0.5 h-4 bg-border" />
      )}
    </div>
  );
}
