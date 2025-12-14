// Flow Editor Side Panel

import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, Route, Megaphone, Bell, Gift, Play, Pause, 
  Settings, ArrowLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DripBlock, FlowStep } from "./types";
import { FlowStepNode } from "./FlowStepNode";
import { StepEditor } from "./StepEditor";
import { StepCustomerList } from "./StepCustomerList";
import { DripTriggerModal } from "./DripTriggerModal";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  route: Route,
  megaphone: Megaphone,
  bell: Bell,
  gift: Gift,
};

interface FlowEditorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: DripBlock | null;
  selectedStep: FlowStep | null;
  onSelectStep: (stepId: string | null) => void;
  onAddStep: (afterStepId?: string) => void;
  onUpdateStep: (stepId: string, updates: Partial<FlowStep>) => void;
  onDeleteStep: (stepId: string) => void;
  onDuplicateStep: (stepId: string) => void;
  onToggleStepEnabled: (stepId: string) => void;
  onReorderSteps: (fromIndex: number, toIndex: number) => void;
  onAddCustomer: (stepId: string, customer: any) => void;
  onRemoveCustomer: (stepId: string, customerId: string) => void;
  onMoveCustomer: (fromStepId: string, toStepId: string, customerId: string) => void;
}

export function FlowEditorPanel({
  open,
  onOpenChange,
  block,
  selectedStep,
  onSelectStep,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onDuplicateStep,
  onToggleStepEnabled,
  onReorderSteps,
  onAddCustomer,
  onRemoveCustomer,
  onMoveCustomer,
}: FlowEditorPanelProps) {
  const { toast } = useToast();
  const [dripModalOpen, setDripModalOpen] = useState(false);
  const [dripModalStepId, setDripModalStepId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flow' | 'edit'>('flow');

  if (!block) return null;

  const Icon = iconMap[block.icon] || Route;
  const dripModalStep = block.steps.find(s => s.id === dripModalStepId);

  const handleOpenDripConfig = (stepId: string) => {
    setDripModalStepId(stepId);
    setDripModalOpen(true);
  };

  const handleSaveDripTrigger = (trigger: any) => {
    if (dripModalStepId) {
      onUpdateStep(dripModalStepId, { trigger });
      toast({ title: "Trigger saved", description: "The drip trigger has been updated." });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-2xl lg:max-w-3xl p-0 flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="p-4 border-b bg-muted/30">
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                block.type === 'lead-journey' ? "bg-blue-100 text-blue-600" :
                block.type === 'community-message' ? "bg-purple-100 text-purple-600" :
                block.type === 'reminders' ? "bg-amber-100 text-amber-600" :
                "bg-pink-100 text-pink-600"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-lg">{block.name}</SheetTitle>
                  {block.isActive && (
                    <Badge className="text-xs bg-emerald-50 text-emerald-600 border-emerald-200">
                      Active
                    </Badge>
                  )}
                </div>
                <SheetDescription className="text-sm">
                  {block.description}
                </SheetDescription>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  {block.isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {block.isActive ? 'Pause' : 'Activate'}
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Navigation when step is selected */}
          {selectedStep && activeTab === 'edit' && (
            <div className="px-4 py-2 border-b bg-muted/20">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => {
                  onSelectStep(null);
                  setActiveTab('flow');
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Flow
              </Button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {selectedStep && activeTab === 'edit' ? (
              /* Step Editor View */
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <StepEditor
                    step={selectedStep}
                    onSave={(updates) => onUpdateStep(selectedStep.id, updates)}
                  />
                  <StepCustomerList
                    step={selectedStep}
                    allSteps={block.steps}
                    onAddCustomer={(customer) => onAddCustomer(selectedStep.id, customer)}
                    onRemoveCustomer={(customerId) => onRemoveCustomer(selectedStep.id, customerId)}
                    onMoveCustomer={(customerId, toStepId) => 
                      onMoveCustomer(selectedStep.id, toStepId, customerId)
                    }
                  />
                </div>
              </ScrollArea>
            ) : (
              /* Flow View */
              <ScrollArea className="h-full">
                <div className="p-4">
                  {/* Stats Bar */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Total Steps</p>
                      <p className="text-lg font-semibold">{block.steps.length}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Active Steps</p>
                      <p className="text-lg font-semibold">{block.steps.filter(s => s.isEnabled).length}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">In Progress</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {block.steps.reduce((acc, s) => acc + s.customers.filter(c => c.status === 'active').length, 0)}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        {block.steps.reduce((acc, s) => acc + s.customers.filter(c => c.status === 'completed').length, 0)}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Flow Steps */}
                  <div className="space-y-4">
                    {block.steps.map((step, index) => (
                      <FlowStepNode
                        key={step.id}
                        step={step}
                        index={index}
                        isSelected={selectedStep?.id === step.id}
                        isFirst={index === 0}
                        isLast={index === block.steps.length - 1}
                        onSelect={() => {
                          onSelectStep(step.id);
                          setActiveTab('edit');
                        }}
                        onOpenDripConfig={() => handleOpenDripConfig(step.id)}
                        onToggleEnabled={() => onToggleStepEnabled(step.id)}
                        onDuplicate={() => onDuplicateStep(step.id)}
                        onDelete={() => onDeleteStep(step.id)}
                        onMoveUp={() => onReorderSteps(index, index - 1)}
                        onMoveDown={() => onReorderSteps(index, index + 1)}
                      />
                    ))}

                    {/* Add Step Button */}
                    <Button
                      variant="outline"
                      className="w-full border-dashed h-14 gap-2"
                      onClick={() => onAddStep()}
                    >
                      <Plus className="h-4 w-4" />
                      Add Step
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Drip Trigger Modal */}
      {dripModalStep && (
        <DripTriggerModal
          open={dripModalOpen}
          onOpenChange={setDripModalOpen}
          trigger={dripModalStep.trigger}
          allowedTriggers={block.allowedTriggers}
          onSave={handleSaveDripTrigger}
        />
      )}
    </>
  );
}
