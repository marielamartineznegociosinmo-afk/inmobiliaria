import { PageTransition } from "@/components/layout/PageTransition";
import { CheckCircle2, Shield, HeartHandshake, MapPin } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function About() {
  useEffect(() => {
    document.title = "Nosotros | Mariela Martínez Negocios Inmobiliarios";
  }, []);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Paraná, Entre Ríos"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Una inmobiliaria familiar,{" "}
              <span className="text-accent">con conocimiento local</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xl text-white/90 font-light leading-relaxed"
            >
              Compra, venta, alquiler y tasaciones en Paraná y la región. Atención personalizada y acompañamiento en cada etapa del proceso.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">Quiénes somos</h2>
              <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Mariela Martínez Negocios Inmobiliarios es una inmobiliaria familiar de Paraná que desarrolla su actividad desde 2020.
                </p>
                <p>
                  Trabajamos en Paraná, Oro Verde, San Benito, Colonia Avellaneda y localidades cercanas. Conocemos el mercado local, los barrios y las particularidades de cada zona.
                </p>
                <p>
                  Creemos que comprar, vender o alquilar una propiedad es una decisión importante. Por eso acompañamos a cada cliente de manera directa, sin intermediarios, con comunicación clara y tiempos de respuesta reales.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Mariela Martínez"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Zones */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-4 max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0 mt-1">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-2">Dónde operamos</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Paraná · Oro Verde · San Benito · Colonia Avellaneda · y localidades cercanas de Entre Ríos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Cómo trabajamos</h2>
            <p className="text-muted-foreground text-lg">
              Los principios que guían cada operación que realizamos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Transparencia",
                desc: "Información clara en cada etapa. Sin letra chica, sin sorpresas."
              },
              {
                icon: HeartHandshake,
                title: "Atención personalizada",
                desc: "Trabajamos directamente con cada cliente, sin derivaciones ni demoras."
              },
              {
                icon: CheckCircle2,
                title: "Conocimiento local",
                desc: "Conocemos el mercado inmobiliario de Paraná y la región en profundidad."
              },
              {
                icon: CheckCircle2,
                title: "Acompañamiento",
                desc: "Estamos en cada paso del proceso, desde la consulta hasta la firma."
              }
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-8 rounded-2xl border border-border/50 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-foreground">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Nuestros servicios</h2>
          <p className="text-center text-primary-foreground/70 mb-16 max-w-xl mx-auto">
            Todo lo que necesitás para operar con seguridad en el mercado inmobiliario de Paraná.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Compra y venta", desc: "Acompañamos la operación completa, desde la búsqueda o publicación hasta la escritura." },
              { title: "Alquileres", desc: "Gestión de contratos, búsqueda de inquilinos y asesoramiento para propietarios." },
              { title: "Tasaciones", desc: "Análisis del valor de tu propiedad en el mercado actual de Paraná y la región." },
              { title: "Asesoramiento", desc: "Consultas sobre el proceso inmobiliario, documentación y aspectos legales." },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6">
                <CheckCircle2 className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-primary-foreground/75 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
