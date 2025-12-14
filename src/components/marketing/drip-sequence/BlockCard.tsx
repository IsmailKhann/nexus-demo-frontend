// Block Card Component

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route, Megaphone, Bell, Gift, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DripBlock } from "./types";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  route: Route,
  megaphone: Megaphone,
  bell: Bell,
  gift: Gift,
};

interface BlockCardProps {
  block: DripBlock;
  isSelected: boolean;
  onClick: () => void;
}

export function BlockCard({ block, isSelected, onClick }: BlockCardProps) {
  const Icon = iconMap[block.icon] || Route;
  const totalCustomers = block.steps.reduce((acc, step) => acc + step.customers.length, 0);
  const activeSteps = block.steps.filter(s => s.isEnabled).length;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md group",
        isSelected 
          ? "border-primary shadow-md ring-2 ring-primary/20" 
          : "hover:border-primary/50"
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            block.type === 'lead-journey' ? "bg-blue-100 text-blue-600" :
            block.type === 'community-message' ? "bg-purple-100 text-purple-600" :
            block.type === 'reminders' ? "bg-amber-100 text-amber-600" :
            "bg-pink-100 text-pink-600"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <ChevronRight className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isSelected ? "rotate-90" : "group-hover:translate-x-1"
          )} />
        </div>
        
        <h3 className="font-semibold text-sm mb-1">{block.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {block.description}
        </p>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs gap-1">
            {activeSteps} / {block.steps.length} steps
          </Badge>
          {totalCustomers > 0 && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Users className="h-3 w-3" />
              {totalCustomers}
            </Badge>
          )}
          {block.isActive && (
            <Badge className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-200">
              Active
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
