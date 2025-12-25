import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Search, Building2, MapPin, Users, DollarSign, Eye, Edit, BarChart3,
  ChevronLeft, ChevronRight, Home, Plus, UserPlus, Wrench, FileText,
  Calendar, Mail, Phone, AlertCircle, CheckCircle, Clock, Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  mockUnits, mockPropertyNotes, mockMaintenanceRequests, mockPropertyFinancials,
  getUnitsForProperty, getNotesForProperty, getMaintenanceForProperty,
  getFinancialsForProperty, getOwnerForProperty, getUnitStatusColor, getUnitTypeLabel,
  Unit, PropertyNote
} from '@/data/unitsData';
import AddTenantModal from '@/components/properties/AddTenantModal';
import UnitDetailPanel from '@/components/properties/UnitDetailPanel';

// =============== PROPERTY DATA (extended with ownership) ===============
export const initialProperties = [
  {
    id: "PROP_001",
    name: "Sunset Towers",
    address_line1: "123 Sunset Blvd",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90028",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
    ],
    description: "Luxury high-rise with rooftop pool and concierge service. Premium amenities including fitness center, spa, and 24/7 security.",
    units_count: 120,
    vacant_count: 6,
    avg_rent: 3200,
    timezone: "PST",
    created_at: "2024-01-01",
    owner_id: "OWNER_001"
  },
  {
    id: "PROP_002",
    name: "Downtown Lofts",
    address_line1: "450 Main St",
    city: "Seattle",
    state: "WA",
    postal_code: "98104",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"
    ],
    description: "Converted industrial lofts in the heart of downtown. High ceilings, exposed brick, and modern finishes.",
    units_count: 80,
    vacant_count: 10,
    avg_rent: 2100,
    timezone: "PST",
    created_at: "2024-01-15",
    owner_id: "OWNER_002"
  },
  {
    id: "PROP_003",
    name: "Riverside Garden",
    address_line1: "789 River Road",
    city: "Portland",
    state: "OR",
    postal_code: "97201",
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
    ],
    description: "Peaceful garden-style apartments along the river. Pet-friendly with walking trails and community garden.",
    units_count: 60,
    vacant_count: 4,
    avg_rent: 1500,
    timezone: "PST",
    created_at: "2024-02-01",
    owner_id: "OWNER_003"
  },
  {
    id: "PROP_005",
    name: "Oceanview Estates",
    address_line1: "1 Ocean Drive",
    city: "Miami",
    state: "FL",
    postal_code: "33139",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
    ],
    description: "Ultra-luxury beachfront condos with panoramic ocean views. Private beach access, valet parking, and concierge services.",
    units_count: 45,
    vacant_count: 2,
    avg_rent: 12000,
    timezone: "EST",
    created_at: "2024-03-01",
    owner_id: "OWNER_004"
  }
];

export interface Property {
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
  owner_id?: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [vacancyFilter, setVacancyFilter] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Property>>({});
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [notes, setNotes] = useState<PropertyNote[]>(mockPropertyNotes);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isUnitDetailOpen, setIsUnitDetailOpen] = useState(false);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [tenantUnit, setTenantUnit] = useState<Unit | null>(null);
  const [newNote, setNewNote] = useState('');
  const [unitStatusFilter, setUnitStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Get unique cities
  const cities = useMemo(() => {
    return [...new Set(properties.map(p => p.city))];
  }, [properties]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const matchesSearch = prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = cityFilter === 'all' || prop.city === cityFilter;
      const matchesVacancy = vacancyFilter === 'all' || 
        (vacancyFilter === 'vacant' && prop.vacant_count > 0) ||
        (vacancyFilter === 'full' && prop.vacant_count === 0);
      return matchesSearch && matchesCity && matchesVacancy;
    });
  }, [properties, searchQuery, cityFilter, vacancyFilter]);

  // Stats
  const stats = useMemo(() => ({
    totalProperties: properties.length,
    totalUnits: properties.reduce((acc, p) => acc + p.units_count, 0),
    totalVacant: properties.reduce((acc, p) => acc + p.vacant_count, 0),
    avgRent: Math.round(properties.reduce((acc, p) => acc + p.avg_rent, 0) / properties.length)
  }), [properties]);

  // Get units for selected property
  const propertyUnits = useMemo(() => {
    if (!selectedProperty) return [];
    const propUnits = units.filter(u => u.property_id === selectedProperty.id);
    if (unitStatusFilter === 'all') return propUnits;
    return propUnits.filter(u => u.status === unitStatusFilter);
  }, [selectedProperty, units, unitStatusFilter]);

  // Get notes for selected property
  const propertyNotes = useMemo(() => {
    if (!selectedProperty) return [];
    return notes.filter(n => n.property_id === selectedProperty.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [selectedProperty, notes]);

  // Get maintenance for selected property
  const propertyMaintenance = useMemo(() => {
    if (!selectedProperty) return [];
    return getMaintenanceForProperty(selectedProperty.id);
  }, [selectedProperty]);

  // Get financials for selected property
  const propertyFinancials = useMemo(() => {
    if (!selectedProperty) return null;
    return getFinancialsForProperty(selectedProperty.id);
  }, [selectedProperty]);

  // Get owner for selected property
  const propertyOwner = useMemo(() => {
    if (!selectedProperty) return null;
    return getOwnerForProperty(selectedProperty.id);
  }, [selectedProperty]);

  const openPropertyDetail = (property: Property) => {
    setSelectedProperty(property);
    setEditData(property);
    setIsDetailOpen(true);
    setEditMode(false);
    setUnitStatusFilter('all');
  };

  const handleSaveEdit = () => {
    if (!selectedProperty) return;
    setProperties(prev => prev.map(p => 
      p.id === selectedProperty.id ? { ...p, ...editData } as Property : p
    ));
    setSelectedProperty({ ...selectedProperty, ...editData } as Property);
    setEditMode(false);
    toast({ title: 'Property updated', description: 'Changes saved (in-memory)' });
  };

  const handleAddTenant = (unitId: string, tenant: Unit['current_tenant']) => {
    setUnits(prev => prev.map(u => 
      u.id === unitId ? { ...u, current_tenant: tenant, status: 'occupied' as const, available_date: null } : u
    ));
  };

  const handleAddNote = () => {
    if (!selectedProperty || !newNote.trim()) return;
    const note: PropertyNote = {
      id: `NOTE_${Date.now()}`,
      property_id: selectedProperty.id,
      note: newNote.trim(),
      created_by: 'Current User',
      created_at: new Date().toISOString()
    };
    setNotes(prev => [...prev, note]);
    setNewNote('');
    toast({ title: 'Note added', description: 'Property note saved' });
  };

  const openAddTenant = (unit: Unit) => {
    setTenantUnit(unit);
    setIsAddTenantOpen(true);
  };

  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (!selectedProperty) return;
    setCurrentImageIndex(prev => 
      prev < selectedProperty.images.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    if (!selectedProperty) return;
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : selectedProperty.images.length - 1
    );
  };

  const getMaintenanceStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      default: return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-full mx-auto animate-fade-in bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Property Management</h1>
          <p className="text-muted-foreground">Manage your property portfolio</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border shadow-sm border-b-2 border-b-primary/15">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Total Properties
            </CardDescription>
            <CardTitle className="text-3xl text-foreground">{stats.totalProperties}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm border-b-2 border-b-primary/15">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Home className="h-4 w-4 text-secondary" />
              Total Units
            </CardDescription>
            <CardTitle className="text-3xl text-foreground">{stats.totalUnits}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm border-b-2 border-b-primary/15">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4 text-status-contacted" />
              Vacant Units
            </CardDescription>
            <CardTitle className="text-3xl text-foreground">{stats.totalVacant}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm border-b-2 border-b-primary/15">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-status-leased" />
              Avg Rent
            </CardDescription>
            <CardTitle className="text-3xl text-foreground">${stats.avgRent.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border focus:ring-2 focus:ring-primary"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[160px] bg-muted border-border">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vacancyFilter} onValueChange={setVacancyFilter}>
              <SelectTrigger className="w-[160px] bg-muted border-border">
                <SelectValue placeholder="Vacancy" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="vacant">Has Vacancy</SelectItem>
                <SelectItem value="full">Fully Occupied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Property Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map(property => (
          <Card 
            key={property.id} 
            className="bg-card border-border cursor-pointer hover:shadow-lg transition-all group overflow-hidden"
            onClick={() => openPropertyDetail(property)}
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={property.images[0] || 'https://via.placeholder.com/800x400?text=No+Image'} 
                alt={property.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge className={`${property.vacant_count > 0 ? 'bg-status-leased' : 'bg-muted'} text-white`}>
                  {property.vacant_count} vacant
                </Badge>
              </div>
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-background/80 text-foreground text-xs">
                  {property.id}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg text-foreground">{property.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {property.city}, {property.state}
              </p>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">{property.units_count} units</span>
                </div>
                <div className="text-sm font-semibold text-primary">
                  ${property.avg_rent.toLocaleString()}/mo avg
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-muted">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-muted">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                  <BarChart3 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Property Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent 
          className="w-full sm:max-w-2xl bg-card border-border overflow-y-auto"
          onEscapeKeyDown={() => setIsDetailOpen(false)}
        >
          {selectedProperty && (
            <>
              {/* Header gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sidebar to-primary opacity-90" />
              
              <SheetHeader className="relative z-10 pt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white">{selectedProperty.id}</Badge>
                </div>
                <SheetTitle className="text-white text-xl">{selectedProperty.name}</SheetTitle>
                <SheetDescription className="text-white/80">
                  {selectedProperty.city}, {selectedProperty.state}
                </SheetDescription>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {editMode ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </SheetHeader>

              <div className="mt-20 space-y-6">
                {/* Image Carousel */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={selectedProperty.images[currentImageIndex] || 'https://via.placeholder.com/800x400?text=No+Image'} 
                    alt={selectedProperty.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedProperty.images.length > 1 && (
                    <>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {selectedProperty.images.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-muted">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="units" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Units</TabsTrigger>
                    <TabsTrigger value="financials" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Financials</TabsTrigger>
                    <TabsTrigger value="maintenance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Maintenance</TabsTrigger>
                    <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Notes</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-muted border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground">Total Units</p>
                          <p className="text-2xl font-bold text-foreground">
                            {editMode ? (
                              <Input 
                                type="number"
                                value={editData.units_count || selectedProperty.units_count}
                                onChange={e => setEditData({...editData, units_count: parseInt(e.target.value)})}
                                className="h-8"
                              />
                            ) : selectedProperty.units_count}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground">Vacant</p>
                          <p className="text-2xl font-bold text-foreground">
                            {editMode ? (
                              <Input 
                                type="number"
                                value={editData.vacant_count || selectedProperty.vacant_count}
                                onChange={e => setEditData({...editData, vacant_count: parseInt(e.target.value)})}
                                className="h-8"
                              />
                            ) : selectedProperty.vacant_count}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground">Avg Rent</p>
                          <p className="text-2xl font-bold text-foreground">
                            {editMode ? (
                              <Input 
                                type="number"
                                value={editData.avg_rent || selectedProperty.avg_rent}
                                onChange={e => setEditData({...editData, avg_rent: parseInt(e.target.value)})}
                                className="h-8"
                              />
                            ) : `$${selectedProperty.avg_rent.toLocaleString()}`}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground">Timezone</p>
                          <p className="text-2xl font-bold text-foreground">{selectedProperty.timezone}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Description</h4>
                      {editMode ? (
                        <Textarea 
                          value={editData.description || selectedProperty.description}
                          onChange={e => setEditData({...editData, description: e.target.value})}
                          className="bg-muted border-border"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{selectedProperty.description}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Address</h4>
                      {editMode ? (
                        <Input 
                          value={editData.address_line1 || selectedProperty.address_line1}
                          onChange={e => setEditData({...editData, address_line1: e.target.value})}
                          className="bg-muted border-border"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {selectedProperty.address_line1}<br />
                          {selectedProperty.city}, {selectedProperty.state} {selectedProperty.postal_code}
                        </p>
                      )}
                    </div>

                    {/* Ownership Entity */}
                    {propertyOwner && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <Building className="h-4 w-4 text-primary" />
                          Ownership Entity
                        </h4>
                        <Card className="bg-muted border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-foreground">{propertyOwner.name}</p>
                                <Badge variant="secondary" className="mt-1">{propertyOwner.type}</Badge>
                              </div>
                            </div>
                            <Separator className="my-3 bg-border" />
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{propertyOwner.contact_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{propertyOwner.contact_email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{propertyOwner.contact_phone}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Property ID & Created */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Property ID</h4>
                        <p className="text-sm text-muted-foreground font-mono">{selectedProperty.id}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Created</h4>
                        <p className="text-sm text-muted-foreground">{selectedProperty.created_at}</p>
                      </div>
                    </div>

                    {editMode && (
                      <Button onClick={handleSaveEdit} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
                        Save Changes
                      </Button>
                    )}
                  </TabsContent>

                  {/* Units Tab */}
                  <TabsContent value="units" className="mt-4">
                    <div className="space-y-4">
                      {/* Unit Filters */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Showing {propertyUnits.length} units
                        </p>
                        <Select value={unitStatusFilter} onValueChange={setUnitStatusFilter}>
                          <SelectTrigger className="w-[140px] h-8 bg-muted border-border">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="occupied">Occupied</SelectItem>
                            <SelectItem value="vacant">Vacant</SelectItem>
                            <SelectItem value="notice">Notice</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Units Table */}
                      <div className="border border-border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableHead className="text-xs">Unit #</TableHead>
                              <TableHead className="text-xs">Type</TableHead>
                              <TableHead className="text-xs">Status</TableHead>
                              <TableHead className="text-xs">Bed/Bath</TableHead>
                              <TableHead className="text-xs">Size</TableHead>
                              <TableHead className="text-xs">Market Rent</TableHead>
                              <TableHead className="text-xs">Deposit</TableHead>
                              <TableHead className="text-xs">Tenant</TableHead>
                              <TableHead className="text-xs">Available</TableHead>
                              <TableHead className="text-xs">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {propertyUnits.map((unit) => (
                              <TableRow 
                                key={unit.id} 
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => { setSelectedUnit(unit); setIsUnitDetailOpen(true); }}
                              >
                                <TableCell className="font-medium text-foreground">{unit.unit_number}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{getUnitTypeLabel(unit.unit_type)}</TableCell>
                                <TableCell>
                                  <Badge className={`${getUnitStatusColor(unit.status)} capitalize text-xs`}>
                                    {unit.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {unit.bedrooms === 0 ? 'Studio' : unit.bedrooms} / {unit.bathrooms}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{unit.size_sqft.toLocaleString()} sf</TableCell>
                                <TableCell className="font-medium text-foreground">${unit.market_rent.toLocaleString()}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">${unit.deposit.toLocaleString()}</TableCell>
                                <TableCell className="text-xs">
                                  {unit.current_tenant ? (
                                    <span className="text-foreground">{unit.current_tenant.name}</span>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {unit.available_date ? format(new Date(unit.available_date), 'MMM d, yyyy') : '—'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0"
                                      onClick={(e) => { e.stopPropagation(); setSelectedUnit(unit); setIsUnitDetailOpen(true); }}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    {!unit.current_tenant && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 text-primary"
                                        onClick={(e) => { e.stopPropagation(); openAddTenant(unit); }}
                                      >
                                        <UserPlus className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {propertyUnits.length === 0 && (
                        <div className="text-center py-8">
                          <Home className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No units found</p>
                          <Button variant="outline" size="sm" className="mt-3 border-border">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Unit
                          </Button>
                        </div>
                      )}

                      <Button variant="outline" className="w-full border-border">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Unit
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Financials Tab */}
                  <TabsContent value="financials" className="mt-4">
                    <div className="space-y-4">
                      {propertyFinancials ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-muted border-border">
                              <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Accounts Receivable</p>
                                <p className="text-2xl font-bold text-foreground">
                                  ${propertyFinancials.accounts_receivable.toLocaleString()}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted border-border">
                              <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Deposits Held</p>
                                <p className="text-2xl font-bold text-foreground">
                                  ${propertyFinancials.deposits_held.toLocaleString()}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted border-border">
                              <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Outstanding Dues</p>
                                <p className="text-2xl font-bold text-amber-400">
                                  ${propertyFinancials.outstanding_dues.toLocaleString()}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted border-border">
                              <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Monthly Rent Summary</p>
                                <p className="text-xl font-bold text-foreground">
                                  ${propertyFinancials.monthly_rent_collected.toLocaleString()}
                                  <span className="text-sm text-muted-foreground font-normal"> / ${propertyFinancials.monthly_rent_expected.toLocaleString()}</span>
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                          <Card className="bg-muted border-border">
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground mb-2">Collection Rate</p>
                              <div className="flex items-center gap-4">
                                <div className="flex-1 bg-background rounded-full h-3 overflow-hidden">
                                  <div 
                                    className="bg-primary h-full rounded-full transition-all"
                                    style={{ width: `${(propertyFinancials.monthly_rent_collected / propertyFinancials.monthly_rent_expected) * 100}%` }}
                                  />
                                </div>
                                <span className="font-bold text-foreground">
                                  {Math.round((propertyFinancials.monthly_rent_collected / propertyFinancials.monthly_rent_expected) * 100)}%
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-muted border-border">
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Occupancy Rate</p>
                              <p className="text-2xl font-bold text-foreground">
                                {Math.round(((selectedProperty.units_count - selectedProperty.vacant_count) / selectedProperty.units_count) * 100)}%
                              </p>
                            </CardContent>
                          </Card>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No financial data available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Maintenance Tab */}
                  <TabsContent value="maintenance" className="mt-4">
                    <div className="space-y-4">
                      {/* Maintenance Summary */}
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-muted border-border">
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-foreground">
                              {propertyMaintenance.length}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Requests</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted border-border">
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-amber-400">
                              {propertyMaintenance.filter(m => m.status === 'open').length}
                            </p>
                            <p className="text-xs text-muted-foreground">Open</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted border-border">
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-400">
                              {propertyMaintenance.filter(m => m.status === 'completed' || m.status === 'closed').length}
                            </p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Maintenance List */}
                      <div className="space-y-2">
                        {propertyMaintenance.map((request) => (
                          <Card key={request.id} className="bg-muted border-border">
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getMaintenanceStatusIcon(request.status)}
                                <div>
                                  <p className="font-medium text-foreground text-sm">{request.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {request.unit_id ? `Unit ${units.find(u => u.id === request.unit_id)?.unit_number || 'N/A'}` : 'Common Area'} • {format(new Date(request.created_at), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={`capitalize text-xs ${
                                  request.priority === 'high' || request.priority === 'urgent' 
                                    ? 'bg-red-500/20 text-red-400' 
                                    : 'bg-muted'
                                }`}>
                                  {request.priority}
                                </Badge>
                                <Badge variant="secondary" className="capitalize text-xs">
                                  {request.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {propertyMaintenance.length === 0 && (
                        <div className="text-center py-8">
                          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No maintenance requests</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Notes Tab */}
                  <TabsContent value="notes" className="mt-4">
                    <div className="space-y-4">
                      {/* Add Note */}
                      <div className="space-y-2">
                        <Textarea 
                          placeholder="Add a note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="bg-muted border-border min-h-[80px]"
                        />
                        <Button 
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </div>

                      <Separator className="bg-border" />

                      {/* Notes List */}
                      <div className="space-y-3">
                        {propertyNotes.map((note) => (
                          <Card key={note.id} className="bg-muted border-border">
                            <CardContent className="p-4">
                              <p className="text-sm text-foreground">{note.note}</p>
                              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{note.created_by}</span>
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {propertyNotes.length === 0 && (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No notes yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Unit Detail Panel */}
      <UnitDetailPanel 
        unit={selectedUnit}
        isOpen={isUnitDetailOpen}
        onClose={() => setIsUnitDetailOpen(false)}
        onAddTenant={openAddTenant}
      />

      {/* Add Tenant Modal */}
      <AddTenantModal 
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        unit={tenantUnit}
        onSave={handleAddTenant}
      />
    </div>
  );
};

export default Properties;
