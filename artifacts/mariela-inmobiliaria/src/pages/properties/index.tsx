import { PageTransition } from "@/components/layout/PageTransition";
import { useSeo } from "@/lib/seo";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListProperties, type Property, type ListPropertiesParams } from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Building, Filter, SlidersHorizontal, X, LayoutGrid, Map as MapIcon, Search } from "lucide-react";
import { motion } from "framer-motion";
import { TYPE_LABELS, DEFAULT_CURRENCY } from "@/lib/property-labels";
import { saveLastListUrl } from "@/lib/list-state";

// El mapa se carga solo cuando alguien lo abre, para que la lista siga siendo rápida.
const PropertiesMap = lazy(() => import("@/components/PropertiesMap"));

type Operation = "todos" | "venta" | "alquiler";
type SortOrder = "recientes" | "precio-asc" | "precio-desc";

const SORT_LABELS: Record<SortOrder, string> = {
  recientes: "Más nuevas primero",
  "precio-asc": "Menor precio",
  "precio-desc": "Mayor precio",
};

// Sin acentos y en minúsculas, para que "Parana" encuentre "Paraná".
function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// "150.000" o "150000" -> 150000. Vacío -> null.
function parseAmount(text: string | null): number | null {
  if (!text) return null;
  const n = Number(text.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatAmount(n: number | null): string {
  return n == null ? "" : n.toLocaleString("es-AR");
}

// Filtros tal como están en la URL (así se pueden compartir y "Volver" los recupera).
function readFilters(search: string) {
  const p = new URLSearchParams(search);
  const op = p.get("operation");
  const operation: Operation = op === "venta" || op === "alquiler" ? op : "todos";
  const type = p.get("type") && TYPE_LABELS[p.get("type")!] ? p.get("type")! : "todos";
  const cur = p.get("currency");
  const currency: "USD" | "ARS" = cur === "USD" || cur === "ARS" ? cur : operation !== "todos" ? DEFAULT_CURRENCY[operation] : "USD";
  const sort = p.get("orden");
  return {
    operation,
    type,
    // "neighborhood" viene del buscador del inicio (links viejos).
    q: p.get("q") ?? p.get("neighborhood") ?? "",
    bedrooms: p.get("bedrooms") ?? "todos",
    minPrice: parseAmount(p.get("minPrice")),
    maxPrice: parseAmount(p.get("maxPrice")),
    currency,
    credit: p.get("credito") === "1",
    sort: (sort === "precio-asc" || sort === "precio-desc" ? sort : "recientes") as SortOrder,
    mapView: p.get("vista") === "mapa",
  };
}

type Filters = ReturnType<typeof readFilters>;

function buildSearch(f: Filters): string {
  const p = new URLSearchParams();
  if (f.operation !== "todos") p.set("operation", f.operation);
  if (f.type !== "todos") p.set("type", f.type);
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.bedrooms !== "todos") p.set("bedrooms", f.bedrooms);
  // El precio solo tiene sentido con una operación elegida (venta en USD, alquiler en ARS).
  if (f.operation !== "todos" && (f.minPrice != null || f.maxPrice != null)) {
    if (f.minPrice != null) p.set("minPrice", String(f.minPrice));
    if (f.maxPrice != null) p.set("maxPrice", String(f.maxPrice));
    if (f.currency !== DEFAULT_CURRENCY[f.operation]) p.set("currency", f.currency);
  }
  if (f.credit) p.set("credito", "1");
  if (f.sort !== "recientes") p.set("orden", f.sort);
  if (f.mapView) p.set("vista", "mapa");
  const qs = p.toString();
  return qs ? `/propiedades?${qs}` : "/propiedades";
}

function matches(p: Property, f: Filters): boolean {
  if (f.q.trim()) {
    const haystack = normalize([p.title, p.neighborhood, p.address, p.city, p.propertyCode ?? ""].join(" "));
    // Todas las palabras tienen que aparecer, en cualquier orden.
    if (!normalize(f.q).split(/\s+/).every((word) => haystack.includes(word))) return false;
  }
  if (f.bedrooms !== "todos") {
    const wanted = Number(f.bedrooms);
    if (p.bedrooms == null) return false;
    if (wanted >= 4 ? p.bedrooms < 4 : p.bedrooms !== wanted) return false;
  }
  if (f.operation !== "todos" && (f.minPrice != null || f.maxPrice != null)) {
    if (p.currency !== f.currency) return false;
    if (f.minPrice != null && p.price < f.minPrice) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
  }
  // Apto crédito es solo para ventas.
  if (f.credit && (!p.creditEligible || p.operation !== "venta")) return false;
  return true;
}

function sortProperties(list: Property[], sort: SortOrder): Property[] {
  const copy = [...list];
  if (sort === "precio-asc" || sort === "precio-desc") {
    const dir = sort === "precio-asc" ? 1 : -1;
    // Primero se agrupa por moneda (no se comparan dólares con pesos).
    copy.sort((a, b) => (a.currency === b.currency ? (a.price - b.price) * dir : a.currency === "USD" ? -1 : 1));
  } else {
    copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return copy;
}

export default function PropertiesList() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const filters = useMemo(() => readFilters(searchString), [searchString]);
  const [showFilters, setShowFilters] = useState(false);

  // Borradores de los campos de texto: se aplican con Enter o "Aplicar".
  const [qDraft, setQDraft] = useState(filters.q);
  const [minDraft, setMinDraft] = useState(formatAmount(filters.minPrice));
  const [maxDraft, setMaxDraft] = useState(formatAmount(filters.maxPrice));

  // Si la URL cambia (menú, botón atrás), los campos se actualizan.
  useEffect(() => {
    setQDraft(filters.q);
    setMinDraft(formatAmount(filters.minPrice));
    setMaxDraft(formatAmount(filters.maxPrice));
  }, [filters.q, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    saveLastListUrl(buildSearch(filters));
  }, [filters]);

  useSeo({
    title: "Propiedades en venta y alquiler en Paraná | Mariela Martínez Negocios Inmobiliarios",
    description: "Casas, departamentos, terrenos, locales y campos en venta y alquiler en Paraná, Entre Ríos. Encontrá tu próxima propiedad con fotos, precios y ubicación.",
    path: "/propiedades",
  });

  const serverParams: ListPropertiesParams = {};
  if (filters.operation !== "todos") serverParams.operation = filters.operation;
  if (filters.type !== "todos") serverParams.type = filters.type as ListPropertiesParams["type"];
  const { data, isLoading } = useListProperties(serverParams);

  const properties = useMemo(
    () => sortProperties((data ?? []).filter((p) => matches(p, filters)), filters.sort),
    [data, filters],
  );

  const update = (changes: Partial<Filters>) => setLocation(buildSearch({ ...filters, ...changes }));

  const applyDrafts = () => {
    update({ q: qDraft, minPrice: parseAmount(minDraft), maxPrice: parseAmount(maxDraft) });
    if (window.innerWidth < 1024) setShowFilters(false);
  };

  const setOperation = (operation: Operation) =>
    // Al cambiar de operación se borra el precio: venta y alquiler usan monedas distintas.
    update({
      operation,
      minPrice: null,
      maxPrice: null,
      currency: operation === "todos" ? "USD" : DEFAULT_CURRENCY[operation],
      // Apto crédito no aplica a alquileres.
      credit: operation === "alquiler" ? false : filters.credit,
    });

  const clearFilters = () => setLocation(filters.mapView ? "/propiedades?vista=mapa" : "/propiedades");

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyDrafts();
    }
  };

  const activeCount =
    (filters.operation !== "todos" ? 1 : 0) + (filters.type !== "todos" ? 1 : 0) + (filters.q ? 1 : 0) +
    (filters.bedrooms !== "todos" ? 1 : 0) + (filters.minPrice != null || filters.maxPrice != null ? 1 : 0) + (filters.credit ? 1 : 0);

  return (
    <PageTransition>
      <div className="bg-muted/30 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-4">
            Propiedades
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Explorá nuestro catálogo de propiedades, utilizá los filtros para encontrar tu lugar ideal.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Ocultar filtros" : `Mostrar filtros${activeCount ? ` (${activeCount})` : ""}`}
          </Button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`lg:w-1/4 lg:block ${showFilters ? "block" : "hidden"}`}>
          <div className="bg-card border rounded-xl p-6 lg:sticky lg:top-28 shadow-sm">
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
                <Label className="text-sm font-semibold text-foreground">¿Qué buscás?</Label>
                <div className="grid grid-cols-3 gap-1 rounded-lg border bg-muted/40 p-1" role="group" aria-label="Operación">
                  {(["todos", "venta", "alquiler"] as Operation[]).map((op) => (
                    <Button
                      key={op}
                      type="button"
                      size="sm"
                      variant={filters.operation === op ? "default" : "ghost"}
                      aria-pressed={filters.operation === op}
                      onClick={() => setOperation(op)}
                    >
                      {op === "todos" ? "Todo" : op === "venta" ? "Comprar" : "Alquilar"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Tipo de inmueble</Label>
                <Select value={filters.type} onValueChange={(type) => update({ type })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="q" className="text-sm font-semibold text-foreground">Barrio, zona o calle</Label>
                <Input
                  id="q"
                  placeholder="Ej. Centro, Los Gobernadores, San Benito"
                  value={qDraft}
                  onChange={(e) => setQDraft(e.target.value)}
                  onKeyDown={onEnter}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Dormitorios</Label>
                <Select value={filters.bedrooms} onValueChange={(bedrooms) => update({ bedrooms })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Cualquiera</SelectItem>
                    <SelectItem value="1">1 dormitorio</SelectItem>
                    <SelectItem value="2">2 dormitorios</SelectItem>
                    <SelectItem value="3">3 dormitorios</SelectItem>
                    <SelectItem value="4">4 o más</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Precio</Label>
                {filters.operation === "todos" ? (
                  <p className="text-sm text-muted-foreground">
                    Elegí <strong>Comprar</strong> o <strong>Alquilar</strong> para filtrar por precio.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/40 p-1" role="group" aria-label="Moneda">
                      {(["USD", "ARS"] as const).map((c) => (
                        <Button
                          key={c}
                          type="button"
                          size="sm"
                          variant={filters.currency === c ? "secondary" : "ghost"}
                          aria-pressed={filters.currency === c}
                          onClick={() => update({ currency: c, minPrice: null, maxPrice: null })}
                        >
                          {c === "USD" ? "Dólares" : "Pesos"}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        inputMode="numeric"
                        placeholder="Desde"
                        aria-label={`Precio desde en ${filters.currency}`}
                        value={minDraft}
                        onChange={(e) => setMinDraft(formatAmount(parseAmount(e.target.value)))}
                        onKeyDown={onEnter}
                      />
                      <Input
                        inputMode="numeric"
                        placeholder="Hasta"
                        aria-label={`Precio hasta en ${filters.currency}`}
                        value={maxDraft}
                        onChange={(e) => setMaxDraft(formatAmount(parseAmount(e.target.value)))}
                        onKeyDown={onEnter}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {filters.operation === "venta" ? "Precio de venta" : "Alquiler mensual"} en {filters.currency === "USD" ? "dólares" : "pesos"}.
                    </p>
                  </>
                )}
              </div>

              {filters.operation !== "alquiler" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="credito"
                  checked={filters.credit}
                  onCheckedChange={(c) => update({ credit: !!c })}
                />
                <Label htmlFor="credito" className="text-sm font-semibold text-foreground cursor-pointer">
                  Solo apto crédito
                </Label>
              </div>
              )}

              <Button onClick={applyDrafts} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                <Search className="w-4 h-4 mr-2" />
                Aplicar filtros
              </Button>
            </div>
          </div>
        </aside>

        {/* Properties Grid */}
        <main className="lg:w-3/4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isLoading ? "Buscando propiedades…" : `${properties.length} ${properties.length === 1 ? "propiedad" : "propiedades"}`}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filters.sort} onValueChange={(sort) => update({ sort: sort as SortOrder })}>
                <SelectTrigger className="w-[190px]" aria-label="Ordenar">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABELS) as SortOrder[]).map((s) => (
                    <SelectItem key={s} value={s}>{SORT_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="inline-flex rounded-lg border bg-card p-1 shadow-sm" role="group" aria-label="Cómo ver las propiedades">
                <Button
                  variant={filters.mapView ? "ghost" : "default"}
                  size="sm"
                  onClick={() => update({ mapView: false })}
                  aria-pressed={!filters.mapView}
                  className="gap-2"
                >
                  <LayoutGrid className="w-4 h-4" /> Lista
                </Button>
                <Button
                  variant={filters.mapView ? "default" : "ghost"}
                  size="sm"
                  onClick={() => update({ mapView: true })}
                  aria-pressed={filters.mapView}
                  className="gap-2"
                >
                  <MapIcon className="w-4 h-4" /> Ver en mapa
                </Button>
              </div>
            </div>
          </div>
          {filters.mapView && !isLoading && properties.length > 0 ? (
            <Suspense fallback={<div className="h-[70vh] min-h-[420px] bg-muted animate-pulse rounded-2xl" />}>
              <PropertiesMap properties={properties} />
            </Suspense>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property, idx) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx, 8) * 0.05 }}
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
