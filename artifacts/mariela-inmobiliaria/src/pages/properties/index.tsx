import { PageTransition } from "@/components/layout/PageTransition";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useListProperties } from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { Building, Filter, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";

export default function PropertiesList() {
  const [_, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const [operation, setOperation] = useState<any>(searchParams.get("operation") || "todos");
  const [type, setType] = useState<any>(searchParams.get("type") || "todos");
  const [neighborhood, setNeighborhood] = useState(searchParams.get("neighborhood") || "");
  const [bedrooms, setBedrooms] = useState<string>(searchParams.get("bedrooms") || "todos");
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 1000000
  ]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = "Propiedades | Mariela Martínez";
  }, []);

  const buildParams = () => {
    const params: any = {};
    if (operation && operation !== "todos") params.operation = operation;
    if (type && type !== "todos") params.type = type;
    if (neighborhood) params.neighborhood = neighborhood;
    if (bedrooms && bedrooms !== "todos") params.bedrooms = Number(bedrooms);
    if (priceRange[0] > 0) params.minPrice = priceRange[0];
    if (priceRange[1] < 1000000) params.maxPrice = priceRange[1];
    return params;
  };

  const { data: properties, isLoading } = useListProperties(buildParams());

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (operation && operation !== "todos") params.append("operation", operation);
    if (type && type !== "todos") params.append("type", type);
    if (neighborhood) params.append("neighborhood", neighborhood);
    if (bedrooms && bedrooms !== "todos") params.append("bedrooms", bedrooms);
    if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString());
    if (priceRange[1] < 1000000) params.append("maxPrice", priceRange[1].toString());
    
    setLocation(`/propiedades?${params.toString()}`);
    if (window.innerWidth < 1024) setShowFilters(false);
  };

  const clearFilters = () => {
    setOperation("todos");
    setType("todos");
    setNeighborhood("");
    setBedrooms("todos");
    setPriceRange([0, 1000000]);
    setLocation("/propiedades");
  };

  return (
    <PageTransition>
      <div className="bg-muted/30 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-4">
            Propiedades
          </h1>
          <p className="text-muted-foreground text-lg max-w-2x2">
            Explorá nuestro catálogo de propiedades, utilizá los filtros para encontrar tu lugar ideal.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`lg:w-1/4 lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <div className="bg-card border rounded-xl p-6 sticky top-28 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <Filter className="w-5 h-5" />
                Filtros
              </h2>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4 mr-1" /> Limpiar
              </Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Operación</Label>
                <Select value={operation} onValueChange={setOperation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="venta">Venta</SelectItem>
                    <SelectItem value="alquiler">Alquiler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Tipo de inmueble</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="departamento">Departamento</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="campo">Campo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Barrio o zona</Label>
                <Input 
                  placeholder="Ej. Centro, Urquiza..." 
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Dormitorios</Label>
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Cualquiera</SelectItem>
                    <SelectItem value="1">1 dormitorio</SelectItem>
                    <SelectItem value="2">2 dormitorios</SelectItem>
                    <SelectItem value="3">3 dormitorios</SelectItem>
                    <SelectItem value="4">4+ dormitorios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-foreground flex justify-between">
                  <span>Precio Máximo</span>
                </Label>
                <Slider 
                  value={[priceRange[1]]} 
                  max={1000000} 
                  step={10000}
                  onValueChange={(vals) => setPriceRange([priceRange[0], vals[0]])}
                  className="py-4"
                />
                <div className="text-sm text-muted-foreground text-right font-medium">
                  Hasta {priceRange[1].toLocaleString('es-AR')}
                </div>
              </div>

              <Button onClick={handleApplyFilters} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </aside>

        {/* Properties Grid */}
        <main className="lg:w-3/4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property, idx) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border rounded-2xl">
              <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-foreground mb-2">No se encontraron propiedades</h3>
              <p className="text-muted-foreground mb-6">Intentá ajustar los filtros para ver más resultados.</p>
              <Button onClick={clearFilters} variant="outline" className="font-semibold">
                Limpiar filtros
              </Button>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}
