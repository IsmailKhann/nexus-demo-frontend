// Step Customer List Component

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  UserPlus, Search, MoreVertical, ArrowRightLeft, 
  Trash2, Mail, Phone, CheckCircle, Clock, XCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowStep, StepCustomer } from "./types";
import { marketingLeads } from "@/data/marketing";
import { useToast } from "@/hooks/use-toast";

interface StepCustomerListProps {
  step: FlowStep;
  allSteps: FlowStep[];
  onAddCustomer: (customer: StepCustomer) => void;
  onRemoveCustomer: (customerId: string) => void;
  onMoveCustomer: (customerId: string, toStepId: string) => void;
}

export function StepCustomerList({
  step,
  allSteps,
  onAddCustomer,
  onRemoveCustomer,
  onMoveCustomer,
}: StepCustomerListProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [targetStepId, setTargetStepId] = useState<string>("");
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  const filteredCustomers = step.customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-3.5 w-3.5 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
      case 'removed': return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'removed': return 'bg-red-50 text-red-600 border-red-200';
      default: return '';
    }
  };

  const availableLeads = marketingLeads.filter(lead => 
    !step.customers.some(c => c.id === lead.id) && !lead.deleted_at
  );

  const handleAddCustomer = () => {
    const lead = marketingLeads.find(l => l.id === selectedLeadId);
    if (!lead) return;

    const newCustomer: StepCustomer = {
      id: lead.id,
      name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      enteredAt: new Date().toISOString(),
      status: 'active',
    };

    onAddCustomer(newCustomer);
    setAddDialogOpen(false);
    setSelectedLeadId("");
    toast({ title: "Customer added", description: `${lead.full_name} has been added to this step.` });
  };

  const handleMoveCustomer = () => {
    if (!selectedCustomerId || !targetStepId) return;
    onMoveCustomer(selectedCustomerId, targetStepId);
    setMoveDialogOpen(false);
    setSelectedCustomerId(null);
    setTargetStepId("");
    toast({ title: "Customer moved", description: "Customer has been moved to the selected step." });
  };

  const handleRemoveCustomer = (customerId: string) => {
    onRemoveCustomer(customerId);
    toast({ title: "Customer removed", description: "Customer has been removed from this step." });
  };

  const otherSteps = allSteps.filter(s => s.id !== step.id);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Customers in Step ({step.customers.length})
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1"
              onClick={() => setAddDialogOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[280px]">
            {filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No customers in this step
              </div>
            ) : (
              <div className="divide-y">
                {filteredCustomers.map((customer) => (
                  <div 
                    key={customer.id} 
                    className="px-4 py-3 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{customer.name}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getStatusBadge(customer.status))}
                          >
                            {getStatusIcon(customer.status)}
                            <span className="ml-1">{customer.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Entered: {new Date(customer.enteredAt).toLocaleDateString()}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => {
                            setSelectedCustomerId(customer.id);
                            setMoveDialogOpen(true);
                          }}>
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Move to Step
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleRemoveCustomer(customer.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer to Step</DialogTitle>
            <DialogDescription>
              Select a lead to add to "{step.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lead..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {availableLeads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    <div className="flex items-center gap-2">
                      <span>{lead.full_name}</span>
                      <span className="text-muted-foreground text-xs">({lead.email})</span>
                    </div>
                  </SelectItem>
                ))}
                {availableLeads.length === 0 && (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No available leads
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomer} 
              disabled={!selectedLeadId}
              className="crm-gradient-primary"
            >
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Customer Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Customer to Another Step</DialogTitle>
            <DialogDescription>
              Select the target step for this customer
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={targetStepId} onValueChange={setTargetStepId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target step..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {otherSteps.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <span>Step {s.order}:</span>
                      <span>{s.title}</span>
                    </div>
                  </SelectItem>
                ))}
                {otherSteps.length === 0 && (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No other steps available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMoveCustomer} 
              disabled={!targetStepId}
              className="crm-gradient-primary"
            >
              Move Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
