import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Bot, Plus, Sparkles, Send, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getMarketingMetrics, type Campaign, type CampaignEvent } from "@/data/marketing";
import { AddLeadModal } from "@/components/marketing/AddLeadModal";
import { CreateCampaignModal } from "@/components/marketing/CreateCampaignModal";
import { CampaignsTab } from "@/components/marketing/CampaignsTab";
import { DripSequenceTab } from "@/components/marketing/DripSequenceTab";
import { SyndicationTab } from "@/components/marketing/SyndicationTab";
import { AttributionTab } from "@/components/marketing/AttributionTab";

export default function Marketing() {
  const { toast } = useToast();
  const [aliaOpen, setAliaOpen] = useState(false);
  const [aliaChatHistory, setAliaChatHistory] = useState<Array<{role: 'user' | 'alia'; message: string}>>([
    { role: 'alia', message: 'Hi! I\'m ALIA, your AI Leasing Assistant. How can I help you with your marketing campaigns today?' }
  ]);
  const [aliaInput, setAliaInput] = useState("");
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);

  const metrics = getMarketingMetrics();

  const handleAliaMessage = () => {
    if (!aliaInput.trim()) return;
    
    const userMessage = aliaInput;
    setAliaChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);
    setAliaInput("");
    
    // Simulate ALIA response
    setTimeout(() => {
      let response = "I can help with that! ";
      if (userMessage.toLowerCase().includes('campaign')) {
        response += "To create a new campaign, click the 'New Campaign' button and choose your audience. Would you like me to suggest segments based on your current leads?";
      } else if (userMessage.toLowerCase().includes('template')) {
        response += "I found 5 templates. The 'Welcome Email' template has a 68% open rate. Would you like to use it?";
      } else if (userMessage.toLowerCase().includes('performance')) {
        response += `Your campaigns this month show ${metrics.avgROI}% average ROI with ${metrics.totalLeadsFromCampaigns} leads generated. The active campaigns are performing above industry average!`;
      } else if (userMessage.toLowerCase().includes('lead')) {
        response += `You have ${metrics.totalLeads} total leads, ${metrics.newThisWeek} new this week, and ${metrics.toursScheduled} tours scheduled. Would you like to see a breakdown by source?`;
      } else {
        response += "I can help you create campaigns, analyze performance, build audience segments, or optimize your drip sequences. What would you like to do?";
      }
      setAliaChatHistory(prev => [...prev, { role: 'alia', message: response }]);
    }, 1000);
  };

  const handleCreateCampaign = (campaign: Campaign, events: CampaignEvent[]) => {
    // In a real app, this would update state and persist
    toast({
      title: "Campaign Created",
      description: `${campaign.name} has been ${campaign.status === 'Active' ? 'launched' : 'scheduled'} successfully.`
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing & Automation</h1>
          <p className="text-muted-foreground">Campaign builder, drip sequences, listing syndication, and attribution</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddLeadOpen(true)} variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Lead
          </Button>
          <Button onClick={() => setAliaOpen(true)} variant="outline" className="gap-2">
            <Bot className="h-4 w-4" />
            Ask ALIA
          </Button>
        </div>
      </div>

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-6 gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{metrics.totalLeads}</p>
          <p className="text-xs text-muted-foreground">Total Leads</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600">+{metrics.newThisWeek}</p>
          <p className="text-xs text-muted-foreground">New This Week</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{metrics.toursScheduled}</p>
          <p className="text-xs text-muted-foreground">Tours Scheduled</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{metrics.avgLeadScore}</p>
          <p className="text-xs text-muted-foreground">Avg Lead Score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{metrics.activeCampaigns}</p>
          <p className="text-xs text-muted-foreground">Active Campaigns</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{metrics.avgROI}%</p>
          <p className="text-xs text-muted-foreground">Avg ROI</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="drip">Drip Sequences</TabsTrigger>
          <TabsTrigger value="syndication">Listing Syndication</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignsTab onNewCampaign={() => setCreateCampaignOpen(true)} />
        </TabsContent>

        <TabsContent value="drip" className="mt-6">
          <DripSequenceTab />
        </TabsContent>

        <TabsContent value="syndication" className="mt-6">
          <SyndicationTab />
        </TabsContent>

        <TabsContent value="attribution" className="mt-6">
          <AttributionTab />
        </TabsContent>
      </Tabs>

      {/* ALIA Chat Widget */}
      <Dialog open={aliaOpen} onOpenChange={setAliaOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              ALIA - AI Marketing Assistant
            </DialogTitle>
            <DialogDescription>
              Get instant help with campaigns, audience segments, and performance insights
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {aliaChatHistory.map((msg, idx) => (
                <div key={idx} className={cn("flex gap-3", msg.role === 'user' && "justify-end")}>
                  {msg.role === 'alia' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    msg.role === 'alia' ? "bg-muted" : "bg-primary text-primary-foreground"
                  )}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ask ALIA about your marketing..."
              value={aliaInput}
              onChange={(e) => setAliaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAliaMessage()}
            />
            <Button onClick={handleAliaMessage} className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Lead Modal */}
      <AddLeadModal 
        open={addLeadOpen} 
        onOpenChange={setAddLeadOpen} 
        onAddLead={(lead, interaction) => {
          toast({
            title: "Lead Created",
            description: `${lead.full_name} has been added successfully.`
          });
        }}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal 
        open={createCampaignOpen} 
        onOpenChange={setCreateCampaignOpen}
        onCreateCampaign={handleCreateCampaign}
      />
    </div>
  );
}
