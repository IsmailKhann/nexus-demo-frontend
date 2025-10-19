import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot,
  MessageSquare,
  Phone,
  TrendingUp,
  Brain,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Users,
  BarChart3,
  Mic,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Star,
  AlertCircle,
  Zap,
  Target,
  Send
} from 'lucide-react';

const AICenter = () => {
  const [aliaInput, setAliaInput] = useState('');
  const [aliaChatMessages, setAliaChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m ALIA, your AI-powered property management assistant. How can I help you today?'
    }
  ]);

  // Mock data for call scoring
  const recentCalls = [
    {
      id: 1,
      agent: 'Sarah Johnson',
      prospect: 'John Smith',
      date: '2025-01-18 14:30',
      duration: '12:45',
      score: 92,
      sentiment: 'positive',
      outcome: 'Tour Scheduled',
      keywords: ['Downtown Lofts', 'Pet-friendly', 'Available Feb 1'],
      aiInsights: 'Excellent rapport building. Successfully addressed pet policy concerns.'
    },
    {
      id: 2,
      agent: 'Mike Chen',
      prospect: 'Emily Davis',
      date: '2025-01-18 11:15',
      duration: '8:30',
      score: 78,
      sentiment: 'neutral',
      outcome: 'Follow-up Required',
      keywords: ['Budget concerns', 'Roommate needed', 'Harbor View'],
      aiInsights: 'Good engagement but price objection not fully resolved. Recommend follow-up with flexible payment options.'
    },
    {
      id: 3,
      agent: 'Sarah Johnson',
      prospect: 'Robert Wilson',
      date: '2025-01-18 09:00',
      duration: '15:20',
      score: 95,
      sentiment: 'positive',
      outcome: 'Application Submitted',
      keywords: ['Sunset Towers', 'Move-in date', 'Lease terms'],
      aiInsights: 'Perfect execution. Clear communication of lease terms led to immediate application.'
    },
    {
      id: 4,
      agent: 'Jessica Lee',
      prospect: 'Amanda Brown',
      date: '2025-01-17 16:45',
      duration: '6:15',
      score: 65,
      sentiment: 'negative',
      outcome: 'Not Interested',
      keywords: ['Location concerns', 'Noise complaints', 'Too expensive'],
      aiInsights: 'Prospect had concerns about neighborhood. Could benefit from virtual tour to showcase amenities.'
    }
  ];

  // AI-powered features
  const aiFeatures = [
    {
      id: 1,
      title: 'Lead Qualification',
      description: 'AI automatically scores and qualifies leads based on behavior and interaction patterns',
      icon: Target,
      status: 'active',
      metrics: { accuracy: '94%', processed: 1247 }
    },
    {
      id: 2,
      title: 'Sentiment Analysis',
      description: 'Real-time analysis of tenant and prospect communications for satisfaction tracking',
      icon: Brain,
      status: 'active',
      metrics: { accuracy: '91%', processed: 3421 }
    },
    {
      id: 3,
      title: 'Document Intelligence',
      description: 'Automated document processing, extraction, and verification',
      icon: FileText,
      status: 'active',
      metrics: { accuracy: '97%', processed: 856 }
    },
    {
      id: 4,
      title: 'Predictive Maintenance',
      description: 'AI predicts maintenance issues before they become problems',
      icon: AlertCircle,
      status: 'active',
      metrics: { accuracy: '88%', prevented: 42 }
    },
    {
      id: 5,
      title: 'Smart Scheduling',
      description: 'Intelligent tour and appointment scheduling based on availability and preferences',
      icon: Clock,
      status: 'active',
      metrics: { efficiency: '89%', scheduled: 234 }
    },
    {
      id: 6,
      title: 'Voice Analytics',
      description: 'Deep analysis of sales calls and tenant interactions',
      icon: Mic,
      status: 'active',
      metrics: { calls: 892, insights: 1247 }
    }
  ];

  // Agent performance
  const agentPerformance = [
    { name: 'Sarah Johnson', calls: 45, avgScore: 89, conversions: 12, trend: 'up' },
    { name: 'Mike Chen', calls: 38, avgScore: 82, conversions: 9, trend: 'up' },
    { name: 'Jessica Lee', calls: 42, avgScore: 85, conversions: 11, trend: 'stable' },
    { name: 'David Kim', calls: 35, avgScore: 91, conversions: 14, trend: 'up' }
  ];

  const handleAliaSend = () => {
    if (!aliaInput.trim()) return;

    // Add user message
    setAliaChatMessages([...aliaChatMessages, {
      role: 'user',
      content: aliaInput
    }]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'I\'ve analyzed your request. Based on current occupancy rates and market trends, I recommend focusing on Sunset Towers and Harbor View apartments for your next marketing campaign.',
        'I found 3 high-priority maintenance requests that need immediate attention. Would you like me to create work orders for these?',
        'Your lead conversion rate has increased by 12% this month. The virtual tour feature is showing strong engagement metrics.',
        'I\'ve generated a detailed report on your property performance. Downtown Lofts shows the highest ROI at 23% annually.'
      ];
      
      setAliaChatMessages(prev => [...prev, {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      }]);
    }, 1000);

    setAliaInput('');
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return ThumbsUp;
      case 'negative': return ThumbsDown;
      default: return AlertCircle;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-purple-500" />
            AI Center
          </h1>
          <p className="text-muted-foreground mt-1">
            ALIA assistant, call scoring, and AI-powered automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Train Models
          </Button>
          <Button>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="alia" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alia">
            <Bot className="h-4 w-4 mr-2" />
            ALIA Assistant
          </TabsTrigger>
          <TabsTrigger value="call-scoring">
            <Phone className="h-4 w-4 mr-2" />
            Call Scoring
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap className="h-4 w-4 mr-2" />
            AI Features
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* ALIA Assistant Tab */}
        <TabsContent value="alia" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Chat Interface */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-500" />
                  Chat with ALIA
                </CardTitle>
                <CardDescription>
                  Ask questions, get insights, and automate tasks with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ScrollArea className="h-[400px] border rounded-lg p-4">
                    <div className="space-y-4">
                      {aliaChatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask ALIA anything about your properties, leads, or operations..."
                      value={aliaInput}
                      onChange={(e) => setAliaInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAliaSend();
                        }
                      }}
                      className="min-h-[60px]"
                    />
                    <Button onClick={handleAliaSend} size="icon" className="h-[60px] w-[60px]">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common AI-powered tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Property Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Analyze Lead Quality
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Market Insights
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="h-4 w-4 mr-2" />
                    Predict Maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Draft Email Response
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Review Performance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Call Scoring Tab */}
        <TabsContent value="call-scoring" className="space-y-4">
          {/* Performance Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Call Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">86.5</div>
                <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +4.2% vs last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">160</div>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28.8%</div>
                <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.1% improvement
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <p className="text-xs text-muted-foreground mt-1">117 calls</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Calls */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Call Analysis</CardTitle>
              <CardDescription>AI-scored calls with insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCalls.map((call) => {
                  const SentimentIcon = getSentimentIcon(call.sentiment);
                  return (
                    <Card key={call.id} className="border-l-4" style={{
                      borderLeftColor: call.score >= 90 ? '#10B981' : 
                                      call.score >= 75 ? '#F59E0B' : '#EF4444'
                    }}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{call.agent}</Badge>
                              <SentimentIcon className={`h-4 w-4 ${getSentimentColor(call.sentiment)}`} />
                              <span className="text-sm text-muted-foreground">{call.date}</span>
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{call.duration}</span>
                            </div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {call.prospect}
                              <Badge className={
                                call.outcome.includes('Scheduled') || call.outcome.includes('Submitted') 
                                  ? 'bg-green-500' 
                                  : call.outcome.includes('Not') 
                                  ? 'bg-red-500' 
                                  : 'bg-yellow-500'
                              }>
                                {call.outcome}
                              </Badge>
                            </CardTitle>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-3xl font-bold flex items-center gap-2">
                              {call.score}
                              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                            </div>
                            <span className="text-xs text-muted-foreground">AI Score</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Brain className="h-4 w-4 text-purple-500" />
                              AI Insights
                            </h5>
                            <p className="text-sm text-muted-foreground">{call.aiInsights}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-semibold mb-2">Key Topics</h5>
                            <div className="flex flex-wrap gap-2">
                              {call.keywords.map((keyword, idx) => (
                                <Badge key={idx} variant="secondary">{keyword}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Volume2 className="h-3 w-3 mr-1" />
                              Play Recording
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="h-3 w-3 mr-1" />
                              View Transcript
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Add Note
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Individual agent call scoring metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformance.map((agent, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{agent.calls} calls</span>
                          <span>•</span>
                          <span>{agent.conversions} conversions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{agent.avgScore}</div>
                        <span className="text-xs text-muted-foreground">Avg Score</span>
                      </div>
                      <TrendingUp className={`h-5 w-5 ${
                        agent.trend === 'up' ? 'text-green-500' : 'text-yellow-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="hover-scale">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="h-8 w-8 text-purple-500" />
                      <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                        {feature.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(feature.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                      <Button className="w-full mt-4" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Metrics</CardTitle>
              <CardDescription>Track the effectiveness of AI-powered features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Lead Qualification Accuracy</span>
                    <span className="text-sm font-bold">94%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Call Score Prediction Accuracy</span>
                    <span className="text-sm font-bold">89%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Document Processing Accuracy</span>
                    <span className="text-sm font-bold">97%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '97%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Time Saved by Automation</span>
                    <span className="text-sm font-bold">187 hours</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Savings</CardTitle>
                <CardDescription>ROI from AI automation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">Admin Time Saved</span>
                    <span className="font-bold">$12,450</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">Lead Quality Improvement</span>
                    <span className="font-bold">$8,920</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">Maintenance Prevention</span>
                    <span className="font-bold">$15,680</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg bg-primary/5">
                    <span className="font-semibold">Total Monthly Savings</span>
                    <span className="text-xl font-bold text-primary">$37,050</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>AI feature utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ALIA Conversations</span>
                      <span className="font-bold">1,247</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Calls Analyzed</span>
                      <span className="font-bold">892</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Documents Processed</span>
                      <span className="font-bold">856</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AICenter;
