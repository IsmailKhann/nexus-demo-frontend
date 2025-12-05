import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  ChevronLeft, ChevronRight, MapPin, Building2, Users, DollarSign, 
  ExternalLink, Home, UserPlus, Clock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PropertyProfileData {
  id: string;
  name: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  images: string[];
  description: string;
  units_count: number;
  vacant_count: number;
  avg_rent: number;
  timezone: string;
  created_at: string;
}

interface PropertyProfileProps {
  property: PropertyProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateLead?: (propertyId: string) => void;
}

const PropertyProfile = ({ property, isOpen, onClose, onCreateLead }: PropertyProfileProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  if (!property) return null;

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev < property.images.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : property.images.length - 1
    );
  };

  const handleOpenInPMS = () => {
    onClose();
    navigate('/properties');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className="w-full sm:max-w-lg bg-card border-border overflow-y-auto"
        onEscapeKeyDown={onClose}
      >
        {/* Header gradient */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-sidebar to-primary opacity-90" />
        
        <SheetHeader className="relative z-10 pt-2">
          <SheetTitle className="text-white text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {property.name}
          </SheetTitle>
          <SheetDescription className="text-white/80 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.city}, {property.state}
          </SheetDescription>
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleOpenInPMS}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open in PMS
            </Button>
            <Button size="sm" variant="secondary">
              <Home className="h-3 w-3 mr-1" />
              View Units
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-16 space-y-5">
          {/* Image Carousel */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img 
              src={property.images[currentImageIndex] || 'https://via.placeholder.com/800x400?text=No+Image'} 
              alt={property.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image';
              }}
            />
            {property.images.length > 1 && (
              <>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {property.images.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-muted border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Home className="h-3 w-3" />
                  Total Units
                </div>
                <p className="text-xl font-bold text-foreground">{property.units_count}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Users className="h-3 w-3" />
                  Vacant
                </div>
                <p className="text-xl font-bold text-foreground">{property.vacant_count}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <DollarSign className="h-3 w-3" />
                  Avg Rent
                </div>
                <p className="text-xl font-bold text-foreground">${property.avg_rent?.toLocaleString() || '—'}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Clock className="h-3 w-3" />
                  Timezone
                </div>
                <p className="text-xl font-bold text-foreground">{property.timezone || 'N/A'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium text-foreground mb-2">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {property.description || 'No description available.'}
            </p>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-medium text-foreground mb-2">Address</h4>
            <p className="text-sm text-muted-foreground">
              {property.address_line1}<br />
              {property.city}, {property.state} {property.postal_code}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="border-border hover:bg-muted"
                onClick={() => onCreateLead?.(property.id)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Lead
              </Button>
              <Button 
                variant="outline" 
                className="border-border hover:bg-muted"
                onClick={handleOpenInPMS}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in PMS
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PropertyProfile;
