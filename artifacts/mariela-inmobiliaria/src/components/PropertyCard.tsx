import { Link } from "wouter";
import { Bed, Bath, Maximize2, MapPin } from "lucide-react";
import { Property } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function formatPrice(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("es-AR")}`;
}

export function PropertyCard({ property }: { property: Property }) {
  const isVenta = property.operation === "venta";

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 h-full flex flex-col">
      <Link href={`/propiedades/${property.id}`} className="block relative aspect-[4/3] overflow-hidden">
        {property.coverPhoto || (property.photos && property.photos.length > 0) ? (
          <img
            src={property.coverPhoto || property.photos[0]}
            alt={property.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge 
            className={`font-semibold tracking-wide uppercase px-3 py-1 ${
              isVenta 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            }`}
          >
            {property.operation}
          </Badge>
          {property.featured && (
            <Badge className="bg-[#18b0e7] text-black hover:bg-yellow-600 font-semibold uppercase px-3 py-1">
              Destacado
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground font-semibold px-3 py-1.5 shadow-sm">
            {property.type}
          </Badge>
        </div>
      </Link>
      
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <p className="text-2xl font-bold text-primary tracking-tight">
            {formatPrice(property.price, property.currency)}
          </p>
        </div>
        
        <Link href={`/propiedades/${property.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex items-start gap-2 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-sm line-clamp-1">{property.neighborhood}, {property.city}</p>
        </div>
        
        <div className="mt-auto grid grid-cols-3 gap-2 border-t pt-4">
          {property.bedrooms != null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Dormitorios">
              <Bed className="w-4 h-4 text-primary/70" />
              <span>{property.bedrooms} Dorm.</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Baños">
              <Bath className="w-4 h-4 text-primary/70" />
              <span>{property.bathrooms} Baños</span>
            </div>
          )}
          {property.totalArea != null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Superficie total">
              <Maximize2 className="w-4 h-4 text-primary/70" />
              <span>{property.totalArea} m²</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
