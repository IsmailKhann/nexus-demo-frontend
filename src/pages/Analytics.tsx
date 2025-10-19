import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Home,
  Calendar,
  Download,
  Filter,
  Sparkles,
  Brain,
  FileText,
  PieChart,
  LineChart,
  BarChart4
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from 'recharts';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedDashboard, setSelectedDashboard] = useState('executive');

  // Mock data for KPIs
  const kpis = [
    {
      title: 'Total Revenue',
      value: '$2,847,392',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Occupancy Rate',
      value: '94.2%',
      change: '+2.3%',
      trend: 'up',
      icon: Home,
      color: 'text-blue-500'
    },
    {
      title: 'Active Leads',
      value: '847',
      change: '+18.7%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-500'
    },
    {
      title: 'Avg. Lease Term',
      value: '14.2 mo',
      change: '-0.8%',
      trend: 'down',
      icon: Calendar,
      color: 'text-orange-500'
    }
  ];

  // Mock revenue data
  const revenueData = [
    { month: 'Jan', revenue: 245000, expenses: 180000, profit: 65000 },
    { month: 'Feb', revenue: 252000, expenses: 185000, profit: 67000 },
    { month: 'Mar', revenue: 268000, expenses: 190000, profit: 78000 },
    { month: 'Apr', revenue: 275000, expenses: 192000, profit: 83000 },
    { month: 'May', revenue: 290000, expenses: 195000, profit: 95000 },
    { month: 'Jun', revenue: 312000, expenses: 198000, profit: 114000 }
  ];

  // Mock occupancy data
  const occupancyData = [
    { property: 'Sunset Towers', occupancy: 95, units: 48 },
    { property: 'Harbor View', occupancy: 98, units: 72 },
    { property: 'Downtown Lofts', occupancy: 89, units: 36 },
    { property: 'Riverside Commons', occupancy: 92, units: 60 },
    { property: 'Mountain View', occupancy: 96, units: 54 }
  ];

  // Mock lead conversion data
  const leadConversionData = [
    { name: 'Inquiries', value: 1250, color: '#8B5CF6' },
    { name: 'Tours Scheduled', value: 680, color: '#3B82F6' },
    { name: 'Applications', value: 420, color: '#10B981' },
    { name: 'Leases Signed', value: 285, color: '#F59E0B' }
  ];

  // Mock reports
  const reports = [
    {
      id: 1,
      name: 'Monthly Financial Summary',
      type: 'Financial',
      lastGenerated: '2025-01-15',
      format: 'PDF',
      status: 'Ready'
    },
    {
      id: 2,
      name: 'Property Performance Report',
      type: 'Operations',
      lastGenerated: '2025-01-14',
      format: 'Excel',
      status: 'Ready'
    },
    {
      id: 3,
      name: 'Lead Source Analysis',
      type: 'Marketing',
      lastGenerated: '2025-01-13',
      format: 'PDF',
      status: 'Ready'
    },
    {
      id: 4,
      name: 'Maintenance Cost Analysis',
      type: 'Operations',
      lastGenerated: '2025-01-12',
      format: 'Excel',
      status: 'Ready'
    },
    {
      id: 5,
      name: 'Tenant Satisfaction Survey',
      type: 'Operations',
      lastGenerated: '2025-01-10',
      format: 'PDF',
      status: 'Processing'
    }
  ];

  // AI Insights
  const aiInsights = [
    {
      id: 1,
      type: 'opportunity',
      title: 'Revenue Optimization Opportunity',
      description: 'Downtown Lofts showing 11% below market rent. Consider 8-12% increase for lease renewals.',
      impact: 'High',
      confidence: 92
    },
    {
      id: 2,
      type: 'risk',
      title: 'Maintenance Cost Trend',
      description: 'Riverside Commons maintenance costs up 23% YoY. Recommend preventive maintenance audit.',
      impact: 'Medium',
      confidence: 87
    },
    {
      id: 3,
      type: 'insight',
      title: 'Lead Conversion Pattern',
      description: 'Virtual tours converting 34% higher than in-person. Expand digital showing capabilities.',
      impact: 'High',
      confidence: 95
    },
    {
      id: 4,
      type: 'opportunity',
      title: 'Seasonal Pricing Strategy',
      description: 'Historical data shows 18% higher demand in Q2. Implement dynamic pricing for March-May.',
      impact: 'Medium',
      confidence: 89
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Business Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Custom dashboards, reports, and AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 90 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dashboard Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard View</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDashboard} onValueChange={setSelectedDashboard}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="executive">Executive</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center gap-1 mt-1`}>
                  <TrendingUp className="h-3 w-3" />
                  {kpi.change} from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Trends */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue & Profitability Trends
                </CardTitle>
                <CardDescription>Monthly revenue, expenses, and profit analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Revenue" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Expenses" />
                    <Area type="monotone" dataKey="profit" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Occupancy by Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5" />
                  Occupancy by Property
                </CardTitle>
                <CardDescription>Current occupancy rates across portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="property" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="occupancy" fill="#8B5CF6" name="Occupancy %" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lead Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Lead Conversion Funnel
                </CardTitle>
                <CardDescription>Journey from inquiry to lease signing</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={leadConversionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leadConversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Scheduled Reports</CardTitle>
                  <CardDescription>Generate and download custom reports</CardDescription>
                </div>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{report.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline">{report.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Last generated: {report.lastGenerated}
                          </span>
                          <Badge variant={report.status === 'Ready' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download {report.format}
                      </Button>
                      <Button variant="ghost" size="sm">
                        Regenerate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Quick access to common report types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {['Executive Summary', 'Portfolio Performance', 'Cash Flow Analysis', 'Leasing Activity', 'Maintenance Costs', 'Marketing ROI'].map((template) => (
                  <Button key={template} variant="outline" className="h-auto py-4">
                    <div className="text-center">
                      <FileText className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">{template}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <CardTitle>AI-Powered Insights</CardTitle>
              </div>
              <CardDescription>
                Machine learning analysis of your property management data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <Card key={insight.id} className="border-l-4" style={{
                    borderLeftColor: insight.type === 'opportunity' ? '#10B981' : 
                                    insight.type === 'risk' ? '#EF4444' : '#3B82F6'
                  }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              insight.type === 'opportunity' ? 'default' : 
                              insight.type === 'risk' ? 'destructive' : 'secondary'
                            }>
                              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                            </Badge>
                            <Badge variant="outline">
                              {insight.confidence}% confidence
                            </Badge>
                            <Badge variant="outline">
                              {insight.impact} Impact
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {insight.description}
                          </CardDescription>
                        </div>
                        <Brain className="h-8 w-8 text-purple-500 ml-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm">View Details</Button>
                        <Button size="sm" variant="outline">Create Task</Button>
                        <Button size="sm" variant="ghost">Dismiss</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                ALIA Analytics Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about your data in natural language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask ALIA about your data... (e.g., 'What's causing the increase in maintenance costs?')"
                    className="flex-1 px-4 py-2 border rounded-md"
                  />
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ask
                  </Button>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <Button variant="outline" className="justify-start text-left h-auto py-3">
                    <span className="text-sm">Which properties have the highest ROI?</span>
                  </Button>
                  <Button variant="outline" className="justify-start text-left h-auto py-3">
                    <span className="text-sm">Show me seasonal occupancy trends</span>
                  </Button>
                  <Button variant="outline" className="justify-start text-left h-auto py-3">
                    <span className="text-sm">Analyze marketing campaign effectiveness</span>
                  </Button>
                  <Button variant="outline" className="justify-start text-left h-auto py-3">
                    <span className="text-sm">Compare this month vs last year</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
