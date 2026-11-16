import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useListProperties, useDeleteProperty, getListPropertiesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Edit, Trash2, Search, ExternalLink, Plus, AlertTriangle, X } from "lucide-react";
import { formatPrice } from "@/components/PropertyCard";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TYPE_LABELS, typeLabel } from "@/lib/property-labels";
import { normalizeCode, addressHasNumber } from "@/lib/property-checks";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { propertyPath } from "@/lib/property-url";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState("todas");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [extraFilter, setExtraFilter] = useState("ninguno");
  // Activas y pausadas: el panel tiene que mostrar todas para poder reactivarlas.
  const { data: activeProperties, isLoading: loadingActive } = useListProperties({ active: true });
  const { data: inactiveProperties, isLoading: loadingInactive } = useListProperties({ active: false });
  const isLoading = loadingActive || loadingInactive;
  const properties = activeProperties || inactiveProperties
    ? [...(activeProperties ?? []), ...(inactiveProperties ?? [])]
    : undefined;
  const deleteMutation = useDeleteProperty();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Códigos repetidos ("Mm-00023" y "MM-00023" cuentan como el mismo).
  const duplicateCodes = useMemo(() => {
    const seen = new Map<string, number>();
    (properties ?? []).forEach((p) => {
      if (!p.propertyCode) return;
      const c = normalizeCode(p.propertyCode);
      seen.set(c, (seen.get(c) ?? 0) + 1);
    });
    return new Set([...seen].filter(([, n]) => n > 1).map(([c]) => c));
  }, [properties]);

  // Cosas para revisar en cada propiedad.
  const issuesOf = (p: NonNullable<typeof properties>[number]): string[] => {
    const issues: string[] = [];
    if (!p.propertyCode) issues.push("Sin código");
    else if (duplicateCodes.has(normalizeCode(p.propertyCode))) issues.push("Código repetido");
    if (p.mapLatitude == null) issues.push("Sin pin en el mapa");
    if (!addressHasNumber(p.address)) issues.push("Dirección sin altura");
    return issues;
  };

  const normalize = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredProperties = useMemo(() => {
    const words = normalize(searchTerm).split(/\s+/).filter(Boolean);
    return (properties ?? [])
      .filter((p) => {
        if (words.length) {
          const haystack = normalize([p.title, p.neighborhood, p.address, p.city, p.propertyCode ?? ""].join(" "));
          if (!words.every((w) => haystack.includes(w))) return false;
        }
        if (operationFilter !== "todas" && p.operation !== operationFilter) return false;
        if (typeFilter !== "todos" && p.type !== typeFilter) return false;
        if (statusFilter === "activas" && !p.active) return false;
        if (statusFilter === "inactivas" && p.active) return false;
        if (statusFilter === "destacadas" && !p.featured) return false;
        if (extraFilter === "credito" && !(p.creditEligible && p.operation === "venta")) return false;
        if (extraFilter === "revisar" && issuesOf(p).length === 0) return false;
        return true;
      })
      .sort((a, b) => normalizeCode(a.propertyCode ?? "").localeCompare(normalizeCode(b.propertyCode ?? ""), "es", { numeric: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, searchTerm, operationFilter, typeFilter, statusFilter, extraFilter, duplicateCodes]);

  const hasFilters = searchTerm || operationFilter !== "todas" || typeFilter !== "todos" || statusFilter !== "todas" || extraFilter !== "ninguno";
  const clearFilters = () => {
    setSearchTerm("");
    setOperationFilter("todas");
    setTypeFilter("todos");
    setStatusFilter("todas");
    setExtraFilter("ninguno");
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`¿Estás seguro que querés eliminar la propiedad "${title}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
            toast({
              title: "Propiedad eliminada",
              description: "La propiedad ha sido eliminada correctamente.",
            });
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "Error",
              description: "No se pudo eliminar la propiedad.",
            });
          }
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Propiedades</h2>
          <p className="text-muted-foreground mt-1">Administrá el catálogo de inmuebles de la inmobiliaria.</p>
        </div>
        <Link href="/admin/propiedades/nueva">
          <Button className="bg-primary text-primary-foreground font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Propiedad
          </Button>
        </Link>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, título, barrio o calle..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={operationFilter} onValueChange={setOperationFilter}>
              <SelectTrigger className="w-[150px]" aria-label="Operación"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Venta y alquiler</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="alquiler">Alquiler</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]" aria-label="Tipo"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" aria-label="Estado"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
                <SelectItem value="activas">Activas</SelectItem>
                <SelectItem value="inactivas">Inactivas</SelectItem>
                <SelectItem value="destacadas">Destacadas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={extraFilter} onValueChange={setExtraFilter}>
              <SelectTrigger className="w-[170px]" aria-label="Otros filtros"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguno">Sin otros filtros</SelectItem>
                <SelectItem value="credito">Apto crédito</SelectItem>
                <SelectItem value="revisar">Para revisar ⚠</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" /> Limpiar
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Cargando…" : `${filteredProperties.length} de ${properties?.length ?? 0} propiedades`}
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando propiedades...</div>
        ) : filteredProperties.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[160px]">Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Operación</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.propertyCode ? normalizeCode(property.propertyCode) : "-"}</TableCell>
                    <TableCell>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-xs text-muted-foreground">{property.address} · {property.neighborhood}, {property.city}</div>
                      {issuesOf(property).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {issuesOf(property).map((issue) => (
                            <span key={issue} className="inline-flex items-center gap-1 rounded bg-amber-100 text-amber-900 px-1.5 py-0.5 text-[11px] font-medium">
                              <AlertTriangle className="w-3 h-3" /> {issue}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={property.operation === "venta" ? "text-primary border-primary" : "text-accent border-accent"}>
                        {property.operation.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{typeLabel(property.type)}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatPrice(property.price, property.currency)}
                    </TableCell>
                    <TableCell>
                      {property.active ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Activa</Badge>
                      ) : (
                        <Badge variant="secondary">Inactiva</Badge>
                      )}
                      {property.featured && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black ml-2">Destacada</Badge>
                      )}
                      {property.creditEligible && property.operation === "venta" && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white ml-2">Apto crédito</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={propertyPath(property)} target="_blank">
                        <Button variant="ghost" size="icon" title="Ver en la web">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/propiedades/${property.id}/editar`}>
                        <Button variant="ghost" size="icon" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar"
                        onClick={() => handleDelete(property.id, property.title)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-16 text-center text-muted-foreground">
            No se encontraron propiedades.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
