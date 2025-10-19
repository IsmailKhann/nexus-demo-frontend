import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Users, Calendar, Wrench, Building2 } from 'lucide-react';
import { fetchDashboardKPIs, fetchLeadsFunnel, fetchOccupancyData, fetchLeads, fetchWorkOrders } from '@/lib/mockApi';
import type { KPIMetric, Lead, WorkOrder } from '@/types';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const Dashboard = () => {
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentWorkOrders, setRecentWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpiData, funnel, occupancy, leads, workOrders] = await Promise.all([
          fetchDashboardKPIs(),
          fetchLeadsFunnel(),
          fetchOccupancyData(),
          fetchLeads(),
          fetchWorkOrders(),
        ]);

        setKpis(kpiData);
        setFunnelData(funnel);
        setOccupancyData(occupancy);
        setRecentLeads(leads.slice(0, 5));
        setRecentWorkOrders(workOrders.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const chartData = funnelData ? funnelData.labels.map((label: string, i: number) => ({
    name: label,
    value: funnelData.values[i]
  })) : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your leasing and operations overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpis.map((kpi, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription>{kpi.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{kpi.value}</div>
                  {kpi.change !== undefined && (
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        kpi.trend === 'up' ? 'text-accent' : 'text-destructive'
                      }`}
                    >
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {Math.abs(kpi.change)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Leads Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Funnel</CardTitle>
            <CardDescription>Conversion pipeline (Last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Occupancy by Property */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy by Property</CardTitle>
            <CardDescription>Current occupancy rates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, occupancy }: any) => `${name}: ${occupancy.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="occupancy"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLeads.slice(0, 3).map((lead) => (
                <div key={lead.id} className="text-sm">
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{lead.status.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
            <Button asChild variant="link" className="mt-4 p-0">
              <Link to="/crm">View all leads →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Wrench className="h-8 w-8 text-accent mb-2" />
            <CardTitle>Active Work Orders</CardTitle>
            <CardDescription>Pending maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentWorkOrders.slice(0, 3).map((wo) => (
                <div key={wo.id} className="text-sm">
                  <p className="font-medium">{wo.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{wo.status.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
            <Button asChild variant="link" className="mt-4 p-0">
              <Link to="/maintenance">View all orders →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Calendar className="h-8 w-8 text-chart-3 mb-2" />
            <CardTitle>Tours Today</CardTitle>
            <CardDescription>Scheduled showings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-2">4</p>
            <p className="text-sm text-muted-foreground">2 completed, 2 upcoming</p>
            <Button asChild variant="link" className="mt-4 p-0">
              <Link to="/crm">View calendar →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
