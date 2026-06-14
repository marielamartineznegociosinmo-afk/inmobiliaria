import { useGetFeaturedProperties, useGetPropertyStats } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Search, Building, Home, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const [_, setLocation] = useLocation();
  const [operation, setOperation] = useState<string>("venta");
  const [type, setType] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");

  const { data: featuredProperties, isLoading: isFeaturedLoading } = useGetFeaturedProperties();
  const { data: stats } = useGetPropertyStats();
  const featuredList = Array.isArray(featuredProperties) ? featuredProperties : [];

  useEffect(() => {
    document.title = "Mariela Martínez | Negocios Inmobiliarios en Paraná";
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (operation) params.append("operation", operation);
    if (type && type !== "todos") params.append("type", type);
    if (neighborhood) params.append("neighborhood", neighborhood);
    setLocation(`/propiedades?${params.toString()}`);
  };

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Propiedad en Paraná"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight"
            >
              Encontrá la propiedad{" "}
              <span className="text-accent">que estás buscando</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed"
            >
              Compra, venta y alquiler de inmuebles en Paraná y la región. Atención personalizada en cada etapa del proceso.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto bg-background p-6 rounded-2xl shadow-2xl"
          >
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="h-12 text-base" data-testid="select-operation">
                  <SelectValue placeholder="Operación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="alquiler">Alquiler</SelectItem>
                </SelectContent>
              </Select>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 text-base" data-testid="select-type">
                  <SelectValue placeholder="Tipo de inmueble" />
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

              <Input
                placeholder="Barrio, zona o ciudad"
                className="h-12 text-base"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                data-testid="input-neighborhood"
              />

              <Button
                type="submit"
                className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground text-base font-semibold"
                data-testid="button-search"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar propiedades
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 tracking-tight">
                Propiedades destacadas
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Una selección de las oportunidades disponibles en Paraná y la región.
              </p>
            </div>
            <Link href="/propiedades">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                data-testid="link-all-properties"
              >
                Ver todas las propiedades
              </Button>
            </Link>
          </div>

          {isFeaturedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[450px] bg-muted animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : featuredList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredList.map((property, idx) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
              <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-foreground mb-2">No hay propiedades destacadas</h3>
              <p className="text-muted-foreground">Pronto agregaremos nuevas oportunidades.</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section — only real data */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center divide-y sm:divide-y-0 sm:divide-x divide-primary-foreground/10">
            <div className="pt-8 sm:pt-0">
              <Home className="w-10 h-10 mx-auto mb-6 text-accent" />
              <p className="text-4xl md:text-5xl font-bold mb-2">
                {stats?.activeProperties ?? 0}
              </p>
              <p className="text-primary-foreground/80 font-medium uppercase tracking-wider text-sm">
                Propiedades disponibles
              </p>
            </div>
            <div className="pt-8 sm:pt-0">
              <Building className="w-10 h-10 mx-auto mb-6 text-accent" />
              <p className="text-4xl md:text-5xl font-bold mb-2">
                {stats?.forSale ?? 0}
              </p>
              <p className="text-primary-foreground/80 font-medium uppercase tracking-wider text-sm">
                En venta
              </p>
            </div>
            <div className="pt-8 sm:pt-0">
              <TrendingUp className="w-10 h-10 mx-auto mb-6 text-accent" />
              <p className="text-4xl md:text-5xl font-bold mb-2">
                {stats?.forRent ?? 0}
              </p>
              <p className="text-primary-foreground/80 font-medium uppercase tracking-wider text-sm">
                En alquiler
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card border shadow-sm rounded-2xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 tracking-tight">
              ¿Querés vender o alquilar tu propiedad?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Hacemos tasaciones gratuitas en Paraná, Oro Verde, San Benito, Colonia Avellaneda y localidades cercanas. Te asesoramos para que tomes la mejor decisión.
            </p>
            <Link href="/tasaciones">
              <Button
                size="lg"
                className="text-base font-semibold px-8 bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-tasacion-cta"
              >
                Solicitá tu tasación gratuita
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
