import { Unit, getUnitStatusColor, getUnitTypeLabel } from '@/data/unitsData';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Phone, Calendar, DollarSign, Home, Ruler, 
  BedDouble, Bath, Tag, FileText, UserPlus, Edit
} from 'lucide-react';
import { format } from 'date-fns';

interface UnitDetailPanelProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onAddTenant: (unit: Unit) => void;
}

const UnitDetailPanel = ({ unit, isOpen, onClose, onAddTenant }: UnitDetailPanelProps) => {
  if (!unit) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-foreground text-xl flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Unit {unit.unit_number}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Badge className={`${getUnitStatusColor(unit.status)} capitalize`}>
                  {unit.status}
                </Badge>
                <span>{getUnitTypeLabel(unit.unit_type)}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Unit Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <BedDouble className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                  <p className="font-semibold text-foreground">{unit.bedrooms === 0 ? 'Studio' : unit.bedrooms}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Bath className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Bathrooms</p>
                  <p className="font-semibold text-foreground">{unit.bathrooms}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="font-semibold text-foreground">{unit.size_sqft.toLocaleString()} sq ft</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Floor</p>
                  <p className="font-semibold text-foreground">{unit.floor}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="bg-border" />

          {/* Rental Details */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Rental Information
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Market Rent</span>
                <span className="font-semibold text-foreground">${unit.market_rent.toLocaleString()}/mo</span>
              </div>
              {unit.current_rent && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Rent</span>
                  <span className="font-semibold text-foreground">${unit.current_rent.toLocaleString()}/mo</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Security Deposit</span>
                <span className="font-semibold text-foreground">${unit.deposit.toLocaleString()}</span>
              </div>
              {unit.available_date && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Available Date</span>
                  <span className="font-semibold text-foreground">
                    {format(new Date(unit.available_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Current Tenant */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Current Tenant
            </h4>
            {unit.current_tenant ? (
              <Card className="bg-muted border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{unit.current_tenant.name}</p>
                      <p className="text-xs text-muted-foreground">Tenant</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{unit.current_tenant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{unit.current_tenant.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(new Date(unit.current_tenant.lease_start), 'MMM d, yyyy')} - {format(new Date(unit.current_tenant.lease_end), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-muted border-border border-dashed">
                <CardContent className="p-6 text-center">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-3">No tenant assigned</p>
                  <Button 
                    size="sm" 
                    onClick={() => onAddTenant(unit)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Tenant
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Features */}
          {unit.features.length > 0 && (
            <>
              <Separator className="bg-border" />
              <div>
                <h4 className="font-medium text-foreground mb-3">Features & Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {unit.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-muted border-border">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {unit.notes && (
            <>
              <Separator className="bg-border" />
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Notes
                </h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg border border-border">
                  {unit.notes}
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1 border-border">
              <Edit className="h-4 w-4 mr-2" />
              Edit Unit
            </Button>
            {!unit.current_tenant && (
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onAddTenant(unit)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UnitDetailPanel;
