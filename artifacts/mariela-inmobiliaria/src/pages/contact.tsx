import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

const WA_LINK = "https://wa.me/5493436214375?text=Hola,%20quiero%20consultar%20sobre%20una%20propiedad";

export default function Contact() {
  useEffect(() => {
    document.title = "Contacto | Mariela Martínez Negocios Inmobiliarios";
  }, []);

  return (
    <PageTransition>
      <div className="bg-muted/30 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-4">Contacto</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Si querés consultar por una propiedad, vender, alquilar o solicitar una tasación, escribinos por WhatsApp y te asesoraremos personalmente.
          </p>
        </div>
      </div>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Primary: WhatsApp CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-2xl p-20 shadow-sm text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-3">Escribinos por WhatsApp</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Contactanos y te responderemos lo antes posible.
              </p>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="w-full h-14 text-base font-bold bg-green-500 hover:bg-green-600 text-white"
                  data-testid="button-whatsapp-contact"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enviar WhatsApp
                </Button>
              </a>
            </motion.div>

            {/* Secondary: Info */}
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6">Información de contacto</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Ubicación</h3>
                      <p className="text-muted-foreground">Paraná, Entre Ríos, Argentina</p>
                      {/* <p className="text-muted-foreground text-sm mt-1">Operamos en Paraná, Oro Verde, San Benito, Colonia Avellaneda y alrededores.</p> */}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Teléfono</h3>
                      <a
                        href="tel:+5493436214375"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-phone"
                      >
                        +54 9 343 621-4375
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Horario de atención</h3>
                      <p className="text-muted-foreground">Lunes a Viernes: 9:30 a 20:00 hs</p>
                      <p className="text-muted-foreground">Sábados: 9:30 a 12:30 hs</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-4">Seguinos en redes</h3>
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/inmobiliaria.marielamartinez/"
                    aria-label="Instagram"
                    className="w-11 h-11 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    data-testid="link-instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/INMOMARIELAMARTINEZ"
                    aria-label="Facebook"
                    className="w-11 h-11 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    data-testid="link-facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
