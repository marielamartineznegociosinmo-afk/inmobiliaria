import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useListProperties, useDeleteProperty, getListPropertiesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Edit, Trash2, Search, ExternalLink, Plus } from "lucide-react";
import { formatPrice } from "@/components/PropertyCard";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: properties, isLoading } = useListProperties();
  const deleteMutation = useDeleteProperty();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredProperties = properties?.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString() === searchTerm
  );

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
        <div className="p-4 border-b border-border flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por título, barrio o ID..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando propiedades...</div>
        ) : filteredProperties && filteredProperties.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
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
                    <TableCell className="font-medium text-muted-foreground">#{property.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-xs text-muted-foreground">{property.neighborhood}, {property.city}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={property.operation === "venta" ? "text-primary border-primary" : "text-accent border-accent"}>
                        {property.operation.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{property.type}</TableCell>
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
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/propiedades/${property.id}`} target="_blank">
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
