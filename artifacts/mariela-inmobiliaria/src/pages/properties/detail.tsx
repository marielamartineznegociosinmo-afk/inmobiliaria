import { PageTransition } from "@/components/layout/PageTransition";
import { PropertyCard, formatPrice } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetProperty, useGetRelatedProperties } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { useEffect, useState } from "react";
import { MapPin, Bed, Bath, Maximize2, Calendar, Car, Home, ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

export default function PropertyDetail() {
  const [, params] = useRoute("/propiedades/:id");
  const id = Number(params?.id);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  const { data: property, isLoading } = useGetProperty(id, { 
    query: { 
      queryKey: ['property', id], 
      enabled: !!id 
  }
  });
  
  const { data: relatedProperties } = useGetRelatedProperties(id, {
    query: { 
      queryKey: ['property', id], 
      enabled: !!id 
  }
  });

  useEffect(() => {
    if (property) {
      document.title = `${property.title} | Mariela Martínez`;
    }
  }, [property]);

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen pt-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-8"></div>
          <div className="h-[60vh] bg-muted animate-pulse rounded-2xl mb-12"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-12 bg-muted animate-pulse rounded"></div>
              <div className="h-32 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="h-64 bg-muted animate-pulse rounded-xl"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!property) {
    return (
      <PageTransition className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Propiedad no encontrada</h2>
        <Link href="/propiedades">
          <Button>Volver a propiedades</Button>
        </Link>
      </PageTransition>
    );
  }

  const allPhotos = property.photos || [];
  if (property.coverPhoto && !allPhotos.includes(property.coverPhoto)) {
    allPhotos.unshift(property.coverPhoto);
  }

  const specs = [
    { icon: <Bed className="w-5 h-5 text-muted-foreground" />, label: "Dormitorios", value: property.bedrooms },
    { icon: <Bath className="w-5 h-5 text-muted-foreground" />, label: "Baños", value: property.bathrooms },
    { icon: <Maximize2 className="w-5 h-5 text-muted-foreground" />, label: "Sup. Cubierta", value: property.coveredArea ? `${property.coveredArea} m²` : null },
    { icon: <Maximize2 className="w-5 h-5 text-muted-foreground" />, label: "Sup. Total", value: property.totalArea ? `${property.totalArea} m²` : null },
    { icon: <Car className="w-5 h-5 text-muted-foreground" />, label: "Cochera", value: property.garage ? "Sí" : "No" },
    { icon: <Calendar className="w-5 h-5 text-muted-foreground" />, label: "Antigüedad", value: property.age ? `${property.age} años` : "A estrenar" },
    { icon: <Home className="w-5 h-5 text-muted-foreground" />, label: "Tipo", value: property.type },
  ].filter(s => s.value != null);

  const whatsappMessage = `Hola, quiero consultar sobre la propiedad: ${property.title} (ID: ${property.id})`;

  return (
    <PageTransition className="bg-background pb-24">
      <WhatsAppButton message={whatsappMessage} />
      
      {/* Lightbox */}
      <AnimatePresence>
        {photoIndex !== null && allPhotos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          >
            <button 
              onClick={() => setPhotoIndex(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex - 1 + allPhotos.length) % allPhotos.length); }}
              className="absolute left-6 text-white/50 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <img 
              src={allPhotos[photoIndex]} 
              alt={`Foto ${photoIndex + 1}`} 
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />

            <button 
              onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex + 1) % allPhotos.length); }}
              className="absolute right-6 text-white/50 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            
            <div className="absolute bottom-6 text-white/70 font-medium">
              {photoIndex + 1} / {allPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 pt-8">
        <Link href="/propiedades" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a resultados
        </Link>

        {/* Gallery */}
        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[50vh] min-h-[400px] mb-12 rounded-2xl overflow-hidden">
            <div 
              className="md:col-span-2 md:row-span-2 relative cursor-pointer group"
              onClick={() => setPhotoIndex(0)}
            >
              <img src={allPhotos[0]} alt="Principal" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            {allPhotos.slice(1, 5).map((photo, i) => (
              <div 
                key={i} 
                className="relative cursor-pointer hidden md:block group overflow-hidden"
                onClick={() => setPhotoIndex(i + 1)}
              >
                <img src={photo} alt={`Foto ${i+2}`} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                {i === 3 && allPhotos.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{allPhotos.length - 5} fotos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-[40vh] bg-muted rounded-2xl flex items-center justify-center mb-12">
            <span className="text-muted-foreground">Sin imágenes</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={property.operation === "venta" ? "bg-primary" : "bg-accent text-accent-foreground"}>
                  {property.operation.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="bg-background">{property.type}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">{property.title}</h1>
              <div className="flex items-center text-muted-foreground text-lg">
                <MapPin className="w-5 h-5 mr-2 shrink-0" />
                <span>{property.address}, {property.neighborhood}, {property.city}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Características principales</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {spec.icon}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{spec.label}</p>
                      <p className="font-semibold">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Descripción</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: property.description?.replace(/\n/g, '<br />') || "Sin descripción." }} />
            </div>

            {property.additionalFeatures && (
              <>
                <Separator />
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Características adicionales</h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground">
                    <p>{property.additionalFeatures}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-28 bg-card border rounded-2xl p-6 shadow-lg">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Precio</p>
                <p className="text-4xl font-bold text-primary tracking-tight">
                  {formatPrice(property.price, property.currency)}
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  className="w-full h-14 text-lg font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white"
                  onClick={() => window.open(`https://wa.me/5493436214375?text=${encodeURIComponent(whatsappMessage)}`, "_blank")}
                >
                  Consultar por WhatsApp
                </Button>
                <Link href="/contacto">
                  <Button variant="outline" className="w-full h-14 text-lg font-semibold border-primary text-primary hover:bg-primary/5">
                    Dejar un mensaje
                  </Button>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-bold text-foreground mb-4">Ubicación aproximada</h3>
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://api.maptiler.com/maps/basic-v2/static/-60.5288,-31.733,13/600x400.png?key=get_your_own_key')] opacity-50 bg-cover bg-center"></div>
                  <div className="relative z-10 flex flex-col items-center bg-background/90 p-4 rounded-xl backdrop-blur-sm border shadow-sm">
                    <MapPin className="w-8 h-8 text-primary mb-2" />
                    <p className="font-semibold text-center">{property.neighborhood}</p>
                    <p className="text-sm text-muted-foreground text-center">{property.city}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties && relatedProperties.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-bold mb-8 text-primary">Propiedades Similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProperties.slice(0, 3).map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
