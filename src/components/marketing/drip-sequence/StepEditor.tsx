// Step Message Editor Component

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Sparkles } from "lucide-react";
import { FlowStep } from "./types";
import { useToast } from "@/hooks/use-toast";

interface StepEditorProps {
  step: FlowStep;
  onSave: (updates: Partial<FlowStep>) => void;
}

export function StepEditor({ step, onSave }: StepEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(step.title);
  const [subject, setSubject] = useState(step.subject || '');
  const [body, setBody] = useState(step.body);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTitle(step.title);
    setSubject(step.subject || '');
    setBody(step.body);
    setHasChanges(false);
  }, [step.id]);

  useEffect(() => {
    const changed = title !== step.title || subject !== (step.subject || '') || body !== step.body;
    setHasChanges(changed);
  }, [title, subject, body, step]);

  const handleSave = () => {
    onSave({ title, subject: subject || undefined, body });
    setHasChanges(false);
    toast({ title: "Step saved", description: "Your changes have been saved." });
  };

  const mergeTokens = [
    '{{first_name}}', '{{last_name}}', '{{email}}', '{{phone}}',
    '{{property_name}}', '{{unit_number}}', '{{lead_score}}',
    '{{tour_link}}', '{{application_link}}', '{{payment_link}}',
  ];

  const insertToken = (token: string) => {
    setBody(prev => prev + ' ' + token);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Message Editor
            {hasChanges && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
                Unsaved
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="gap-1 crm-gradient-primary"
              disabled={!hasChanges}
              onClick={handleSave}
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step Title */}
        <div className="space-y-2">
          <Label htmlFor="step-title">Step Title</Label>
          <Input
            id="step-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter step title..."
          />
        </div>

        {/* Subject Line */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject Line</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
          />
        </div>

        {/* Message Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="body">Message Body</Label>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Merge Tokens:</span>
            </div>
          </div>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter message content..."
            rows={8}
            className="font-mono text-sm"
          />
          
          {/* Merge Token Quick Insert */}
          <div className="flex flex-wrap gap-1 pt-2">
            {mergeTokens.map((token) => (
              <Button
                key={token}
                variant="outline"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => insertToken(token)}
              >
                {token}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
