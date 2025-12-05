import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Building2, MapPin, Users, DollarSign, Eye, Edit, BarChart3,
  ChevronLeft, ChevronRight, Home, Plus, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// =============== PROPERTY DATA (extended) ===============
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
    created_at: "2024-01-01"
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
    created_at: "2024-01-15"
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
    created_at: "2024-02-01"
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
    created_at: "2024-03-01"
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

  const openPropertyDetail = (property: Property) => {
    setSelectedProperty(property);
    setEditData(property);
    setIsDetailOpen(true);
    setEditMode(false);
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
          className="w-full sm:max-w-xl bg-card border-border overflow-y-auto"
          onEscapeKeyDown={() => setIsDetailOpen(false)}
        >
          {selectedProperty && (
            <>
              {/* Header gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sidebar to-primary opacity-90" />
              
              <SheetHeader className="relative z-10 pt-2">
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
                  <Button size="sm" variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    View Units
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
                  <TabsList className="grid w-full grid-cols-4 bg-muted">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
                    <TabsTrigger value="units" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Units</TabsTrigger>
                    <TabsTrigger value="financials" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Financials</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Settings</TabsTrigger>
                  </TabsList>

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

                    {editMode && (
                      <Button onClick={handleSaveEdit} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
                        Save Changes
                      </Button>
                    )}
                  </TabsContent>

                  <TabsContent value="units" className="mt-4">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {selectedProperty.units_count} units for this property.
                      </p>
                      <div className="grid gap-2">
                        {Array.from({ length: Math.min(5, selectedProperty.units_count) }).map((_, idx) => (
                          <Card key={idx} className="bg-muted border-border">
                            <CardContent className="p-3 flex items-center justify-between">
                              <div>
                                <p className="font-medium text-foreground">Unit {101 + idx}</p>
                                <p className="text-xs text-muted-foreground">
                                  {idx < selectedProperty.vacant_count ? 'Vacant' : 'Occupied'}
                                </p>
                              </div>
                              <Badge className={idx < selectedProperty.vacant_count ? 'bg-status-leased' : 'bg-muted'}>
                                ${Math.round(selectedProperty.avg_rent * (0.9 + Math.random() * 0.2)).toLocaleString()}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full border-border">
                        View All Units
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="financials" className="mt-4">
                    <div className="space-y-4">
                      <Card className="bg-muted border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                          <p className="text-2xl font-bold text-foreground">
                            ${((selectedProperty.units_count - selectedProperty.vacant_count) * selectedProperty.avg_rent).toLocaleString()}
                          </p>
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
                      <Card className="bg-muted border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground">Potential Revenue</p>
                          <p className="text-2xl font-bold text-foreground">
                            ${(selectedProperty.units_count * selectedProperty.avg_rent).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Property ID</h4>
                        <p className="text-sm text-muted-foreground">{selectedProperty.id}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Created</h4>
                        <p className="text-sm text-muted-foreground">{selectedProperty.created_at}</p>
                      </div>
                      <Button variant="destructive" className="w-full">
                        Delete Property
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Properties;
