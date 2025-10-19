import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
}

const Placeholder = ({ title, description }: PlaceholderProps) => {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            This feature is part of the Nexus demo. Click below to return to the dashboard.
          </p>
          <Button asChild variant="outline">
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Placeholder;
