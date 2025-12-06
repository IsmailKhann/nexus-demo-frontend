import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Phone, Mail, MessageSquare, Globe, Users, Building, List, User } from "lucide-react";
import { leadSources } from "@/data/marketing";

interface SourceBadgeProps {
  sourceId?: string;
  channel?: string;
  utmSource?: string;
  className?: string;
  showDetail?: boolean;
}

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'ILS': Building,
  'Web Chat': Globe,
  'Web Form': Globe,
  'Website': Globe,
  'Walk-In': User,
  'Referral': Users,
  'Craigslist': List,
  'Phone': Phone,
  'Call': Phone,
  'SMS': MessageSquare,
  'Email': Mail,
  'PPC': Globe,
  'Social': Users,
  'Direct': Globe,
  'Organic': User,
  'Classifieds': List,
  'Outbound': Phone,
};

const categoryColors: Record<string, string> = {
  'ILS': 'bg-crm-primary/10 text-crm-primary border-crm-primary/30',
  'Direct': 'bg-blue-50 text-blue-700 border-blue-200',
  'Organic': 'bg-green-50 text-green-700 border-green-200',
  'Referral': 'bg-purple-50 text-purple-700 border-purple-200',
  'Social': 'bg-pink-50 text-pink-700 border-pink-200',
  'PPC': 'bg-orange-50 text-orange-700 border-orange-200',
  'Classifieds': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Outbound': 'bg-slate-50 text-slate-700 border-slate-200',
};

export function SourceBadge({ sourceId, channel, utmSource, className, showDetail = false }: SourceBadgeProps) {
  const source = sourceId ? leadSources.find(s => s.id === sourceId) : null;
  
  const displayChannel = source?.category || channel || 'Unknown';
  const displayName = source?.name || channel || 'Unknown';
  const detail = utmSource || source?.description || '';
  
  const IconComponent = channelIcons[displayChannel] || channelIcons[channel || ''] || Globe;
  const colorClass = categoryColors[source?.category || ''] || 'bg-slate-50 text-slate-700 border-slate-200';

  if (!showDetail) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`gap-1 ${colorClass} ${className}`}>
              <IconComponent className="h-3 w-3" />
              <span className="text-xs">{source?.category || displayChannel}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{displayName}</p>
            {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className={`gap-1 ${colorClass}`}>
        <IconComponent className="h-3 w-3" />
        <span className="text-xs">{source?.category || displayChannel}</span>
      </Badge>
      <span className="text-sm text-crm-text-secondary">
        ({displayName}{utmSource && utmSource !== displayName ? ` / ${utmSource}` : ''})
      </span>
    </div>
  );
}
