import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fetchWorkOrders, updateWorkOrderStatus } from '@/lib/mockApi';
import type { WorkOrder } from '@/types';
import { Wrench, AlertCircle, Clock, CheckCircle, XCircle, DollarSign, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const priorityColors: Record<WorkOrder['priority'], string> = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  emergency: 'bg-red-500',
};

const statusColors: Record<WorkOrder['status'], string> = {
  new: 'bg-blue-500',
  assigned: 'bg-purple-500',
  in_progress: 'bg-orange-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
};

const statusIcons: Record<WorkOrder['status'], typeof Clock> = {
  new: AlertCircle,
  assigned: User,
  in_progress: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

const Maintenance = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, priorityFilter, workOrders]);

  const loadWorkOrders = async () => {
    try {
      const data = await fetchWorkOrders();
      setWorkOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load work orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...workOrders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((wo) => wo.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((wo) => wo.priority === priorityFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: WorkOrder['status']) => {
    try {
      await updateWorkOrderStatus(orderId, newStatus);
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.id === orderId ? { ...wo, status: newStatus, updatedAt: new Date().toISOString() } : wo
        )
      );
      toast({
        title: 'Status updated',
        description: 'Work order status has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update work order status',
        variant: 'destructive',
      });
    }
  };

  const openOrderDetail = (order: WorkOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: WorkOrder['status']) => {
    const Icon = statusIcons[status];
    return <Icon className="h-4 w-4" />;
  };

  const stats = {
    total: workOrders.length,
    new: workOrders.filter(wo => wo.status === 'new').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance & Operations</h1>
          <p className="text-muted-foreground">Work order management and vendor tracking</p>
        </div>
        <Button className="nexus-gradient-primary text-white">
          <Wrench className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New Requests</CardDescription>
            <CardTitle className="text-3xl text-blue-500">{stats.new}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-orange-500">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-500">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Board */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">Loading work orders...</CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              No work orders found matching your criteria
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openOrderDetail(order)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">{order.title}</CardTitle>
                    <CardDescription className="mt-1">{order.category}</CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${priorityColors[order.priority]} text-white flex-shrink-0`}
                  >
                    {order.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {order.description}
                </p>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${statusColors[order.status]} text-white capitalize`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status.replace('_', ' ')}</span>
                  </Badge>
                </div>

                {order.estimatedCost && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Est:</span>
                    <span className="font-medium">${order.estimatedCost}</span>
                    {order.actualCost && (
                      <>
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="font-medium">${order.actualCost}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Created: {formatDate(order.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Work Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  {selectedOrder.title}
                </DialogTitle>
                <DialogDescription>
                  Work Order #{selectedOrder.id} - {selectedOrder.category}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Status and Priority */}
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={`${statusColors[selectedOrder.status]} text-white capitalize`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status.replace('_', ' ')}</span>
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`${priorityColors[selectedOrder.priority]} text-white capitalize`}
                  >
                    {selectedOrder.priority}
                  </Badge>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.description}</p>
                  </CardContent>
                </Card>

                {/* Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Property ID:</span>
                      <span className="font-medium">{selectedOrder.propertyId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unit ID:</span>
                      <span className="font-medium">{selectedOrder.unitId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tenant ID:</span>
                      <span className="font-medium">{selectedOrder.tenantId}</span>
                    </div>
                    {selectedOrder.assignedVendorId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Assigned Vendor:</span>
                        <span className="font-medium">{selectedOrder.assignedVendorId}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Costs */}
                {(selectedOrder.estimatedCost || selectedOrder.actualCost) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Cost Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedOrder.estimatedCost && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Cost:</span>
                          <span className="font-medium">${selectedOrder.estimatedCost}</span>
                        </div>
                      )}
                      {selectedOrder.actualCost && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Actual Cost:</span>
                          <span className="font-medium">${selectedOrder.actualCost}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Change Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => handleStatusChange(selectedOrder.id, value as WorkOrder['status'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Maintenance;
