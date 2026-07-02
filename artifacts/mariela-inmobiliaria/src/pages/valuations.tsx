import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, ClipboardCheck, MapPin, MessageCircle, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

const WA_TASACION = "https://wa.me/5493436214375?text=Hola,%20quiero%20solicitar%20una%20tasación%20para%20mi%20propiedad.";

export default function Valuations() {
  useEffect(() => {
    document.title = "Tasaciones | Mariela Martínez Negocios Inmobiliarios";
  }, []);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20 lg:py-28">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
          >
            ¿Querés saber cuánto vale tu propiedad?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl text-primary-foreground/80 font-light leading-relaxed mb-10"
          >
            Realizamos tasaciones en Paraná, Oro Verde, San Benito, Colonia Avellaneda y localidades cercanas. Analizamos tu propiedad, su ubicación y el mercado actual para brindarte una orientación clara y realista.          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <a href={WA_TASACION} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
                data-testid="button-tasacion-hero"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                Solicitá tu tasación
              </Button>
            </a>
            
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-background relative -mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary text-center mb-12">Cómo funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                step: "1",
                title: "Nos contactás",
                desc: "Escribinos por WhatsApp con los datos principales de tu propiedad y coordinamos los pasos a seguir."
              },
              {
                icon: MapPin,
                step: "2",
                title: "Evaluamos la propiedad",
                desc: "Relevamos la ubicación, el estado general, las características y la documentación disponible."
              },
              {
                icon: Calculator,
                step: "3",
                title: "Análisis de mercado",
                desc: "Comparamos con propiedades similares en la zona y analizamos el valor actual según el mercado."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-none shadow-lg bg-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
                      <item.icon className="w-7 h-7 text-accent" />
                    </div>
                    <div className="text-xs font-bold tracking-widest text-accent uppercase mb-2">Paso {item.step}</div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why free / trust */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <ClipboardCheck className="w-12 h-12 text-primary mx-auto mb-4" />
            {/* <h2 className="text-2xl font-bold text-primary mb-4">¿Por qué es gratuita?</h2> */}
            <p className="text-muted-foreground text-lg leading-relaxed">
              Conocer el valor de una propiedad es un paso importante para tomar buenas decisiones. Por eso realizamos un análisis serio, con conocimiento del mercado local y una comunicación clara desde el primer momento.            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              "Análisis",
              "Compromiso",
              "Comunicación"
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-3 bg-card border rounded-xl px-5 py-4">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                <span className="font-semibold text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      {/*<section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">¿Listo para dar el primer paso?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Escribinos y coordinamos una visita a tu propiedad.
          </p>
          <a href={WA_TASACION} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
              data-testid="button-tasacion-bottom"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Solicitá tu tasación gratis
            </Button>
          </a>
        </div>
      </section>
      */}
    </PageTransition>
  );
}
