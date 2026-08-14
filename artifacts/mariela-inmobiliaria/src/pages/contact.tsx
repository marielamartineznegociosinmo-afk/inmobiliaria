import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";
import { MapPin, Phone, Clock, Instagram, Facebook, MessageCircle, Mail, DollarSign, Home, ClipboardCheck, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const WA_NUMBER = "5493436214375";
const EMAIL = "marielamartineznegociosinmo@gmail.com";

const QUICK_WA = [
  {
    icon: DollarSign,
    label: "Comprar propiedad",
    message: "Hola, quiero comprar una propiedad en Paraná. ¿Podrían asesorarme?",
  },
  {
    icon: Home,
    label: "Alquilar",
    message: "Hola, quiero alquilar una propiedad en Paraná. ¿Qué opciones tienen disponibles?",
  },
  {
    icon: ClipboardCheck,
    label: "Vender",
    message: "Hola, quiero vender una propiedad en Paraná. ¿Podrían asesorarme?",
  },
];

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Contacto | Mariela Martínez Negocios Inmobiliarios";
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await customFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, phone, reason, message }),
      });
      setSubmitted(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar la consulta",
        description: "Probá de nuevo en un momento, o escribinos directamente por WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="bg-muted/30 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-4">Contacto</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Si querés consultar por una propiedad, vender, alquilar o solicitar una tasación, escribinos por email o por WhatsApp y te asesoraremos personalmente.
          </p>
        </div>
      </div>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Primary: Contact form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-2xl p-8 md:p-10 shadow-sm"
            >
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-primary mb-3">¡Consulta enviada!</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    Recibimos tu consulta y te vamos a contactar a la brevedad. Si preferís una respuesta más rápida, también podés escribirnos por WhatsApp.
                  </p>
                  <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="font-semibold" data-testid="button-contact-whatsapp-fallback">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Escribir por WhatsApp
                    </Button>
                  </a>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-primary mb-2">Dejanos tu consulta</h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                    Completá el formulario y te vamos a contactar por email con la información que necesitás.
                  </p>
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" data-testid="input-contact-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tu número de contacto" data-testid="input-contact-phone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Motivo de tu consulta</Label>
                      <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej. Alquilar un depto en Centro" data-testid="input-contact-reason" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea id="message" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Contanos más detalles..." className="min-h-[100px]" data-testid="input-contact-message" />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                      data-testid="button-contact-submit"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      {isSubmitting ? "Enviando..." : "Enviar consulta"}
                    </Button>
                  </form>
                </>
              )}
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
                      <p className="text-muted-foreground text-sm mt-1">Operamos en Paraná, Oro Verde, San Benito, Colonia Avellaneda y alrededores.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Teléfono / WhatsApp</h3>
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
                      <p className="text-muted-foreground">Lunes a Viernes: 8:30 a 13:00 y 15:30 a 20:00 hs</p>
                      <p className="text-muted-foreground">Sábados: 9:00 a 13:00 hs</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-4">Seguinos en redes</h3>
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/inmobiliaria.marielamartinez/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-11 h-11 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    data-testid="link-instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/INMOMARIELAMARTINEZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-11 h-11 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    data-testid="link-facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-4">Consultas rápidas por WhatsApp</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {QUICK_WA.map((item, i) => (
                    <a
                      key={i}
                      href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(item.message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-quick-wa-${i}`}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-12 font-semibold border-[#25D366]/40 text-[#1EBE5D] hover:bg-[#25D366]/10"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
