import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, ArrowRight, X, Clock, Building } from 'lucide-react';
import { format } from 'date-fns';
import type { MaintenanceRequest } from '@/types/maintenance';

interface RequestsPanelProps {
  requests: MaintenanceRequest[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onConvertToWorkOrder: (request: MaintenanceRequest) => void;
  onDeclineRequest: (requestId: string) => void;
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  emergency: 'bg-red-500',
};

const statusColors = {
  pending: 'bg-blue-500',
  converted: 'bg-green-500',
  declined: 'bg-gray-500',
};

export function RequestsPanel({
  requests,
  searchQuery,
  onSearchChange,
  onConvertToWorkOrder,
  onDeclineRequest,
}: RequestsPanelProps) {
  const filteredRequests = requests.filter(
    (req) =>
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = filteredRequests.filter((r) => r.status === 'pending');
  const processedRequests = filteredRequests.filter((r) => r.status !== 'pending');

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d, h:mm a');
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search requests by title, tenant, or property..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Pending Requests</CardTitle>
              <CardDescription>Customer requests awaiting review</CardDescription>
            </div>
            <Badge variant="secondary">{pendingRequests.length} pending</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending requests</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-xs text-muted-foreground">{request.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.tenantName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Building className="h-3 w-3" />
                        {request.propertyName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${priorityColors[request.priority]} text-white`}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(request.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => onConvertToWorkOrder(request)}
                          className="bg-primary"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Convert
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onConvertToWorkOrder(request)}>
                              Convert to Work Order
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDeclineRequest(request.id)}
                            >
                              Decline Request
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recently Processed</CardTitle>
            <CardDescription>Requests that have been converted or declined</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.slice(0, 10).map((request) => (
                  <TableRow key={request.id} className="opacity-75">
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-xs text-muted-foreground">{request.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.tenantName}</TableCell>
                    <TableCell>{request.propertyName}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[request.status]} text-white`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(request.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
