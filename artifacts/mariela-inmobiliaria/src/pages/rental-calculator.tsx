import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Calculator, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { AboutHero } from "@/components/layout/AboutHero";

export default function RentalCalculator() {
  useEffect(() => {
    document.title = "Calculadora de alquileres | Mariela Martínez Negocios Inmobiliarios";
  }, []);

  return (
    <PageTransition>
      <AboutHero
        title="Calculadora de alquileres"
        subtitle="Una herramienta externa de referencia para actualizar contratos de alquiler."
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-card border rounded-2xl p-8 md:p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Calculator className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Herramienta útil para alquileres</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Si necesitás una referencia orientativa para actualizar un alquiler, podés usar esta calculadora externa.
            </p>
            <a href="https://arquiler.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="h-12 px-8 font-semibold" data-testid="button-open-calculator">
                Abrir calculadora de alquileres
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <p className="text-xs text-muted-foreground/80 mt-5">
              El resultado es orientativo. Si querés revisar un caso puntual, podemos ayudarte a analizarlo.
            </p>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
