import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import type { ExtendedWorkOrder, Vendor, CategoryStats, VendorPerformance } from '@/types/maintenance';

interface AnalyticsTabProps {
  workOrders: ExtendedWorkOrder[];
  vendors: Vendor[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AnalyticsTab({
  workOrders,
  vendors,
  timeRange,
  onTimeRangeChange,
}: AnalyticsTabProps) {
  // Calculate category statistics
  const getCategoryStats = (): CategoryStats[] => {
    const categories = ['Plumbing', 'HVAC', 'Electrical', 'Appliance', 'General Maintenance'];
    return categories.map((category) => {
      const orders = workOrders.filter((wo) => wo.category === category);
      return {
        category,
        total: orders.length,
        pending: orders.filter((wo) => wo.status === 'new' || wo.status === 'assigned').length,
        inProgress: orders.filter((wo) => wo.status === 'in_progress').length,
        completed: orders.filter((wo) => wo.status === 'completed').length,
        avgResolutionTime: Math.random() * 24 + 12, // Mock average resolution time in hours
      };
    });
  };

  // Calculate vendor performance
  const getVendorPerformance = (): VendorPerformance[] => {
    return vendors.map((vendor) => ({
      vendorId: vendor.id,
      vendorName: vendor.name,
      category: vendor.category,
      totalJobs: vendor.completedJobs + Math.floor(Math.random() * 10),
      completedJobs: vendor.completedJobs,
      avgCompletionTime: vendor.avgResponseTime * 8 + Math.random() * 12,
      rating: vendor.rating,
      onTimeRate: 85 + Math.random() * 15,
      costEfficiency: 90 + Math.random() * 10,
    }));
  };

  // Request volume by time (mock data)
  const getRequestVolumeByTime = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
      day,
      requests: Math.floor(Math.random() * 15) + 5,
      completed: Math.floor(Math.random() * 10) + 3,
    }));
  };

  // Building/property statistics
  const getBuildingStats = () => {
    const properties = [...new Set(workOrders.map((wo) => wo.propertyName))];
    return properties.map((property) => {
      const orders = workOrders.filter((wo) => wo.propertyName === property);
      return {
        property,
        total: orders.length,
        open: orders.filter((wo) => wo.status !== 'completed' && wo.status !== 'cancelled').length,
        avgResponse: (Math.random() * 4 + 1).toFixed(1),
      };
    });
  };

  const categoryStats = getCategoryStats();
  const vendorPerformance = getVendorPerformance();
  const requestVolume = getRequestVolumeByTime();
  const buildingStats = getBuildingStats();

  // Summary stats
  const totalRequests = workOrders.length;
  const openRequests = workOrders.filter(
    (wo) => wo.status !== 'completed' && wo.status !== 'cancelled'
  ).length;
  const completedThisPeriod = workOrders.filter((wo) => wo.status === 'completed').length;
  const avgResponseTime = 2.3; // Mock value in hours
  const slaCompliance = 94.5; // Mock percentage

  return (
    <div className="space-y-6">
      {/* Header with Time Range */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reports & Analytics</h2>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-500">{openRequests}</div>
            <p className="text-sm text-muted-foreground">Open Requests</p>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" /> +3
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{completedThisPeriod}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +8%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{avgResponseTime}h</div>
            <p className="text-sm text-muted-foreground">Avg Response</p>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <Clock className="h-3 w-3 mr-1" /> -15%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{slaCompliance}%</div>
            <p className="text-sm text-muted-foreground">SLA Compliance</p>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <CheckCircle className="h-3 w-3 mr-1" /> On target
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Request Volume by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Volume by Day</CardTitle>
            <CardDescription>Daily request and completion trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={requestVolume}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar dataKey="requests" fill="hsl(var(--primary))" name="Requests" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="hsl(142, 76%, 36%)" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requests by Category</CardTitle>
            <CardDescription>Distribution of work orders by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryStats.map(s => ({ name: s.category, value: s.total }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Performance</CardTitle>
          <CardDescription>Detailed breakdown by maintenance category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead className="text-center">In Progress</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Avg Resolution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryStats.map((stat) => (
                <TableRow key={stat.category}>
                  <TableCell className="font-medium">{stat.category}</TableCell>
                  <TableCell className="text-center">{stat.total}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{stat.pending}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-orange-500">{stat.inProgress}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-500">{stat.completed}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{stat.avgResolutionTime.toFixed(1)}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Building Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests by Building</CardTitle>
          <CardDescription>Work order distribution across properties</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead className="text-center">Total Requests</TableHead>
                <TableHead className="text-center">Open</TableHead>
                <TableHead className="text-center">Avg Response Time</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buildingStats.map((stat) => (
                <TableRow key={stat.property}>
                  <TableCell className="font-medium">{stat.property || 'Unknown Property'}</TableCell>
                  <TableCell className="text-center">{stat.total}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={stat.open > 2 ? 'destructive' : 'secondary'}>
                      {stat.open}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{stat.avgResponse}h</TableCell>
                  <TableCell className="text-center">
                    {stat.open > 2 ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" /> Attention
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500 gap-1">
                        <CheckCircle className="h-3 w-3" /> Good
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendor Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendor Performance</CardTitle>
          <CardDescription>Performance metrics for external vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Jobs</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Avg Time</TableHead>
                <TableHead className="text-center">On-Time %</TableHead>
                <TableHead className="text-center">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorPerformance.map((vendor) => (
                <TableRow key={vendor.vendorId}>
                  <TableCell className="font-medium">{vendor.vendorName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{vendor.category}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{vendor.totalJobs}</TableCell>
                  <TableCell className="text-center">{vendor.completedJobs}</TableCell>
                  <TableCell className="text-center">{vendor.avgCompletionTime.toFixed(1)}h</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={
                        vendor.onTimeRate > 90
                          ? 'bg-green-500'
                          : vendor.onTimeRate > 80
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }
                    >
                      {vendor.onTimeRate.toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{vendor.rating}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
