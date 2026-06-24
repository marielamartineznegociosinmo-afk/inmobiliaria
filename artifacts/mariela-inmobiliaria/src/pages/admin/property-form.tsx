import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProperty, useUpdateProperty, useGetProperty, getListPropertiesQueryKey } from "@workspace/api-client-react";
import { useRoute, useLocation, Link } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function PropertyForm() {
  const [, params] = useRoute("/admin/propiedades/:id/editar");
  const isEditing = !!params?.id;
  const id = Number(params?.id);
  
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: property, isLoading: isPropertyLoading } = useGetProperty(id, {
   query: { 
      queryKey: ['property', id], // O la estructura de key que use tu proyecto
      enabled: isEditing 
  }
  });

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "casa" as any,
    operation: "venta" as any,
    price: 0,
    currency: "USD" as any,
    neighborhood: "",
    address: "",
    city: "Paraná",
    bedrooms: "",
    bathrooms: "",
    coveredArea: "",
    totalArea: "",
    garage: false,
    age: "",
    additionalFeatures: "",
    photos: [] as string[],
    coverPhoto: "",
    featured: false,
    active: true,
  });

  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (isEditing && property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        type: property.type as any,
        operation: property.operation as any,
        price: property.price || 0,
        currency: property.currency as any,
        neighborhood: property.neighborhood || "",
        address: property.address || "",
        city: property.city || "Paraná",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        coveredArea: property.coveredArea?.toString() || "",
        totalArea: property.totalArea?.toString() || "",
        garage: property.garage || false,
        age: property.age?.toString() || "",
        additionalFeatures: property.additionalFeatures || "",
        photos: property.photos || [],
        coverPhoto: property.coverPhoto || "",
        featured: property.featured || false,
        active: property.active ?? true,
      });
    }
  }, [isEditing, property]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingFiles(true);
    try {
      const newUrls: string[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const fd = new FormData();
        fd.append("file", file);
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        
        if (!response.ok) throw new Error("Upload failed");
        
        const result = await response.json();
        newUrls.push(result.url);
      }
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newUrls],
        coverPhoto: prev.coverPhoto || newUrls[0] // Set first uploaded as cover if none exists
      }));
      
      toast({
        title: "Fotos subidas",
        description: `Se han subido ${newUrls.length} fotos correctamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron subir las fotos.",
      });
    } finally {
      setUploadingFiles(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => {
      const newPhotos = [...prev.photos];
      const removed = newPhotos.splice(index, 1)[0];
      return {
        ...prev,
        photos: newPhotos,
        coverPhoto: prev.coverPhoto === removed && newPhotos.length > 0 ? newPhotos[0] : prev.coverPhoto === removed ? "" : prev.coverPhoto
      };
    });
  };

  const setAsCover = (url: string) => {
    setFormData(prev => ({ ...prev, coverPhoto: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      coveredArea: formData.coveredArea ? Number(formData.coveredArea) : undefined,
      totalArea: formData.totalArea ? Number(formData.totalArea) : undefined,
      age: formData.age ? Number(formData.age) : undefined,
      price: Number(formData.price),
    };

    if (isEditing) {
      updateMutation.mutate(
        { id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
            toast({ title: "Propiedad actualizada", description: "Los cambios se guardaron correctamente." });
            setLocation("/admin");
          },
          onError: () => toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la propiedad." })
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
            toast({ title: "Propiedad creada", description: "La propiedad se publicó correctamente." });
            setLocation("/admin");
          },
          onError: () => toast({ variant: "destructive", title: "Error", description: "No se pudo crear la propiedad." })
        }
      );
    }
  };

  if (isEditing && isPropertyLoading) {
    return <AdminLayout><div className="p-8">Cargando...</div></AdminLayout>;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isEditing ? "Editar Propiedad" : "Nueva Propiedad"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold">Título de la publicación <span className="text-destructive">*</span></Label>
                  <Input 
                    id="title" 
                    value={formData.title} 
                    onChange={e => handleInputChange("title", e.target.value)} 
                    required 
                    placeholder="Ej. Excelente Casa en Barrio Urquiza"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold">Descripción <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={e => handleInputChange("description", e.target.value)} 
                    required 
                    className="min-h-[200px]"
                    placeholder="Detalles, estado, ventajas de ubicación..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="operation">Operación <span className="text-destructive">*</span></Label>
                    <Select value={formData.operation} onValueChange={v => handleInputChange("operation", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="venta">Venta</SelectItem>
                        <SelectItem value="alquiler">Alquiler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Inmueble <span className="text-destructive">*</span></Label>
                    <Select value={formData.type} onValueChange={v => handleInputChange("type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="departamento">Departamento</SelectItem>
                        <SelectItem value="terreno">Terreno</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="oficina">Oficina</SelectItem>
                        <SelectItem value="campo">Campo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="price">Precio <span className="text-destructive">*</span></Label>
                    <Input 
                      id="price" 
                      type="number" 
                      min="0"
                      value={formData.price} 
                      onChange={e => handleInputChange("price", e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda <span className="text-destructive">*</span></Label>
                    <Select value={formData.currency} onValueChange={v => handleInputChange("currency", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2">Ubicación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Barrio / Zona <span className="text-destructive">*</span></Label>
                    <Input 
                      id="neighborhood" 
                      value={formData.neighborhood} 
                      onChange={e => handleInputChange("neighborhood", e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad <span className="text-destructive">*</span></Label>
                    <Input 
                      id="city" 
                      value={formData.city} 
                      onChange={e => handleInputChange("city", e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Dirección (Uso interno o visible) <span className="text-destructive">*</span></Label>
                    <Input 
                      id="address" 
                      value={formData.address} 
                      onChange={e => handleInputChange("address", e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2">Características</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Dormitorios</Label>
                    <Input id="bedrooms" type="number" min="0" value={formData.bedrooms} onChange={e => handleInputChange("bedrooms", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Baños</Label>
                    <Input id="bathrooms" type="number" min="0" value={formData.bathrooms} onChange={e => handleInputChange("bathrooms", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coveredArea">Sup. Cubierta (m²)</Label>
                    <Input id="coveredArea" type="number" min="0" value={formData.coveredArea} onChange={e => handleInputChange("coveredArea", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalArea">Sup. Total (m²)</Label>
                    <Input id="totalArea" type="number" min="0" value={formData.totalArea} onChange={e => handleInputChange("totalArea", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Antigüedad (años)</Label>
                    <Input id="age" type="number" min="0" value={formData.age} onChange={e => handleInputChange("age", e.target.value)} placeholder="0 = a estrenar" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="garage" 
                    checked={formData.garage} 
                    onCheckedChange={c => handleInputChange("garage", !!c)} 
                  />
                  <Label htmlFor="garage">Tiene cochera</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalFeatures">Características adicionales</Label>
                  <Textarea 
                    id="additionalFeatures" 
                    value={formData.additionalFeatures} 
                    onChange={e => handleInputChange("additionalFeatures", e.target.value)} 
                    placeholder="Pileta, quincho, losa radiante..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Form */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2">Estado</h3>
                
                <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg">
                  <Checkbox 
                    id="active" 
                    checked={formData.active} 
                    onCheckedChange={c => handleInputChange("active", !!c)} 
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="active" className="font-bold">Propiedad Activa</Label>
                    <p className="text-xs text-muted-foreground">Visible en la web pública</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg">
                  <Checkbox 
                    id="featured" 
                    checked={formData.featured} 
                    onCheckedChange={c => handleInputChange("featured", !!c)} 
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="featured" className="font-bold">Destacar en Inicio</Label>
                    <p className="text-xs text-muted-foreground">Aparecerá en el slider principal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2">Fotos</h3>
                
                <div>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={uploadingFiles}
                    />
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="font-medium text-sm">Hacé click para subir fotos</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG (máx 5MB)</p>
                    {uploadingFiles && <p className="text-sm text-primary font-bold mt-2">Subiendo...</p>}
                  </div>
                </div>

                {formData.photos.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Galería ({formData.photos.length})</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.photos.map((photo, i) => (
                        <div key={i} className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${formData.coverPhoto === photo ? 'border-primary' : 'border-transparent'}`}>
                          <img src={photo} alt={`Foto ${i}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <button 
                              type="button" 
                              onClick={() => removePhoto(i)}
                              className="self-end bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {formData.coverPhoto !== photo && (
                              <button 
                                type="button" 
                                onClick={() => setAsCover(photo)}
                                className="bg-primary text-white text-xs font-bold py-1 rounded w-full mt-auto hover:bg-primary/90"
                              >
                                Hacer Portada
                              </button>
                            )}
                          </div>
                          {formData.coverPhoto === photo && (
                            <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] font-bold text-center py-1">
                              PORTADA
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Publicar Propiedad")}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
