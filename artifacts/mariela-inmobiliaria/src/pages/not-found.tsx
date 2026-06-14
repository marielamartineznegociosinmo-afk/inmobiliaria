import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home as HomeIcon } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Página no encontrada | Mariela Martínez";
  }, []);

  return (
    <PageTransition className="min-h-[70vh] flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-8xl md:text-9xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Esta página no existe</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
          Lo sentimos, no pudimos encontrar la página que estás buscando. Es posible que haya sido eliminada o que el enlace sea incorrecto.
        </p>
        <Link href="/">
          <Button size="lg" className="font-semibold px-8 h-12 bg-primary hover:bg-primary/90 text-white">
            <HomeIcon className="w-5 h-5 mr-2" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </PageTransition>
  );
}
