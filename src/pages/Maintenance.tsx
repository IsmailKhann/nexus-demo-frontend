import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchWorkOrders, updateWorkOrderStatus } from '@/lib/mockApi';
import type { WorkOrder } from '@/types';
import type { ExtendedWorkOrder, Vendor, MaintenanceRequest, InternalTeam } from '@/types/maintenance';
import { Wrench, AlertCircle, Clock, CheckCircle, XCircle, DollarSign, User, BarChart3, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateWorkOrderModal } from '@/components/maintenance/CreateWorkOrderModal';
import { WorkOrderDetailPanel } from '@/components/maintenance/WorkOrderDetailPanel';
import { AnalyticsTab } from '@/components/maintenance/AnalyticsTab';
import { RequestsPanel } from '@/components/maintenance/RequestsPanel';
import vendorsData from '@/data/vendors.json';

const priorityColors: Record<WorkOrder['priority'], string> = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  emergency: 'bg-red-500',
};

const statusConfig = {
  new: { label: 'New', icon: AlertCircle, color: 'bg-blue-500' },
  assigned: { label: 'Assigned', icon: User, color: 'bg-purple-500' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-orange-500' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-gray-500' },
};

const statusOrder: WorkOrder['status'][] = ['new', 'assigned', 'in_progress', 'completed'];

// Mock data
const mockTeams: InternalTeam[] = [
  { id: 'team-1', name: 'Building Maintenance Team', category: 'General Maintenance', members: ['John', 'Mike'], status: 'available' },
  { id: 'team-2', name: 'HVAC Specialists', category: 'HVAC', members: ['Dave', 'Steve'], status: 'available' },
];

const mockRequests: MaintenanceRequest[] = [
  { id: 'req-1', tenantId: 't1', tenantName: 'John Smith', unitId: 'u101', propertyId: 'p1', propertyName: 'Sunset Apartments', title: 'AC Not Cooling', description: 'AC running but not cold', priority: 'high', status: 'pending', category: 'HVAC', createdAt: new Date().toISOString() },
  { id: 'req-2', tenantId: 't2', tenantName: 'Jane Doe', unitId: 'u205', propertyId: 'p2', propertyName: 'Oak Grove Condos', title: 'Leaky Faucet', description: 'Kitchen faucet dripping', priority: 'low', status: 'pending', category: 'Plumbing', createdAt: new Date(Date.now() - 3600000).toISOString() },
];

const Maintenance = () => {
  const [workOrders, setWorkOrders] = useState<ExtendedWorkOrder[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockRequests);
  const [isLoading, setIsLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<ExtendedWorkOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [requestToConvert, setRequestToConvert] = useState<MaintenanceRequest | null>(null);
  const [activeTab, setActiveTab] = useState('board');
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('30d');
  const [requestSearch, setRequestSearch] = useState('');
  const { toast } = useToast();

  const vendors = vendorsData as Vendor[];

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      const data = await fetchWorkOrders();
      // Transform to ExtendedWorkOrder
      const extended: ExtendedWorkOrder[] = data.map((wo) => ({
        ...wo,
        tenantName: `Tenant ${wo.tenantId}`,
        propertyName: `Property ${wo.propertyId}`,
        assignedVendorName: wo.assignedVendorId ? vendors.find(v => v.id === wo.assignedVendorId)?.name : undefined,
        attachments: [],
        notes: [],
        timeline: [{ id: `evt-${wo.id}`, type: 'created' as const, description: 'Work order created', timestamp: wo.createdAt, userId: 'system', userName: 'System', userRole: 'system' as const }],
      }));
      setWorkOrders(extended);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load work orders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getOrdersByStatus = (status: WorkOrder['status']) => {
    let filtered = workOrders.filter(wo => wo.status === status);
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(wo => wo.priority === priorityFilter);
    }
    return filtered;
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    const newStatus = destination.droppableId as WorkOrder['status'];
    handleStatusChange(draggableId, newStatus);
  };

  const handleStatusChange = async (orderId: string, newStatus: WorkOrder['status']) => {
    try {
      await updateWorkOrderStatus(orderId, newStatus);
      setWorkOrders((prev) => prev.map((wo) => wo.id === orderId ? { ...wo, status: newStatus, updatedAt: new Date().toISOString() } : wo));
      toast({ title: 'Status updated', description: 'Work order status has been updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update work order status', variant: 'destructive' });
    }
  };

  const handleCreateWorkOrder = (workOrder: Partial<ExtendedWorkOrder>) => {
    setWorkOrders(prev => [workOrder as ExtendedWorkOrder, ...prev]);
    if (requestToConvert) {
      setRequests(prev => prev.map(r => r.id === requestToConvert.id ? { ...r, status: 'converted' as const } : r));
      setRequestToConvert(null);
    }
  };

  const handleConvertRequest = (request: MaintenanceRequest) => {
    setRequestToConvert(request);
    setIsCreateModalOpen(true);
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'declined' as const } : r));
    toast({ title: 'Request Declined', description: 'The maintenance request has been declined' });
  };

  const handleUpdateWorkOrder = (updatedOrder: ExtendedWorkOrder) => {
    setWorkOrders(prev => prev.map(wo => wo.id === updatedOrder.id ? updatedOrder : wo));
    setSelectedOrder(updatedOrder);
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const stats = {
    total: workOrders.length,
    new: workOrders.filter(wo => wo.status === 'new').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance & Operations</h1>
          <p className="text-muted-foreground">Work order management and vendor tracking</p>
        </div>
        <Button className="nexus-gradient-primary text-white" onClick={() => setIsCreateModalOpen(true)}>
          <Wrench className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total Orders</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>New Requests</CardDescription><CardTitle className="text-3xl text-blue-500">{stats.new}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>In Progress</CardDescription><CardTitle className="text-3xl text-orange-500">{stats.inProgress}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Completed</CardDescription><CardTitle className="text-3xl text-green-500">{stats.completed}</CardTitle></CardHeader></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="board"><ClipboardList className="h-4 w-4 mr-2" />Work Orders</TabsTrigger>
          <TabsTrigger value="requests"><AlertCircle className="h-4 w-4 mr-2" />Requests</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4 mt-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><span className="text-sm font-medium">Filter by priority:</span>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-48"><SelectValue placeholder="Filter by priority" /></SelectTrigger><SelectContent><SelectItem value="all">All Priorities</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent></Select>
          </div></CardContent></Card>

          {isLoading ? <Card><CardContent className="p-6">Loading work orders...</CardContent></Card> : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statusOrder.map((status) => {
                  const config = statusConfig[status];
                  const orders = getOrdersByStatus(status);
                  const Icon = config.icon;
                  return (
                    <div key={status} className="flex flex-col min-h-[500px]">
                      <Card className="mb-3"><CardHeader className="pb-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={`p-1.5 rounded ${config.color}`}><Icon className="h-4 w-4 text-white" /></div><CardTitle className="text-base">{config.label}</CardTitle></div><Badge variant="secondary">{orders.length}</Badge></div></CardHeader></Card>
                      <Droppable droppableId={status}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 space-y-3 p-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-accent/50' : ''}`}>
                            {orders.map((order, index) => (
                              <Draggable key={order.id} draggableId={order.id} index={index}>
                                {(provided, snapshot) => (
                                  <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`cursor-pointer hover:shadow-md transition-shadow ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`} onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}>
                                    <CardHeader className="pb-3"><div className="flex items-start justify-between gap-2"><CardTitle className="text-sm line-clamp-2 flex-1">{order.title}</CardTitle><Badge variant="secondary" className={`${priorityColors[order.priority]} text-white text-xs flex-shrink-0`}>{order.priority}</Badge></div><CardDescription className="text-xs">{order.category}</CardDescription></CardHeader>
                                    <CardContent className="space-y-2"><p className="text-xs text-muted-foreground line-clamp-2">{order.description}</p>{order.estimatedCost && <div className="flex items-center gap-1 text-xs"><DollarSign className="h-3 w-3 text-muted-foreground" /><span className="font-medium">${order.estimatedCost}</span></div>}<div className="text-xs text-muted-foreground pt-2 border-t">{formatDate(order.createdAt)}</div></CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {orders.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No orders</div>}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <RequestsPanel requests={requests} searchQuery={requestSearch} onSearchChange={setRequestSearch} onConvertToWorkOrder={handleConvertRequest} onDeclineRequest={handleDeclineRequest} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab workOrders={workOrders} vendors={vendors} timeRange={analyticsTimeRange} onTimeRangeChange={setAnalyticsTimeRange} />
        </TabsContent>
      </Tabs>

      <CreateWorkOrderModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} vendors={vendors} teams={mockTeams} onCreateWorkOrder={handleCreateWorkOrder} requestToConvert={requestToConvert ? { id: requestToConvert.id, title: requestToConvert.title, description: requestToConvert.description, category: requestToConvert.category, priority: requestToConvert.priority, tenantId: requestToConvert.tenantId, tenantName: requestToConvert.tenantName, unitId: requestToConvert.unitId, propertyId: requestToConvert.propertyId, propertyName: requestToConvert.propertyName } : undefined} />
      <WorkOrderDetailPanel workOrder={selectedOrder} open={isDetailOpen} onOpenChange={setIsDetailOpen} vendors={vendors} onUpdateWorkOrder={handleUpdateWorkOrder} />
    </div>
  );
};

export default Maintenance;
