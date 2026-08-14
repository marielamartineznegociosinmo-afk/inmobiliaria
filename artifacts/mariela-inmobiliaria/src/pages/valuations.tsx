import { PageTransition } from "@/components/layout/PageTransition";
import { AboutHero } from "@/components/layout/AboutHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";
import { Calculator, ClipboardCheck, MapPin, MessageCircle, CheckCircle2, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const WA_TASACION = "https://wa.me/5493436214375?text=Hola,%20quiero%20solicitar%20una%20tasación%20para%20mi%20propiedad.";

const PROPERTY_TYPES = [
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "terreno", label: "Terreno" },
  { value: "local", label: "Local" },
  { value: "oficina", label: "Oficina" },
  { value: "campo", label: "Campo" },
  { value: "cochera", label: "Cochera" },
];

const STEPS = [
  {
    icon: MessageCircle,
    step: "1",
    title: "Nos contactás",
    desc: "Completá el formulario con los datos de tu propiedad y coordinamos los pasos a seguir."
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
];

export default function Valuations() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Tasaciones | Mariela Martínez Negocios Inmobiliarios";
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await customFetch("/api/valuation", {
        method: "POST",
        body: JSON.stringify({ name, phone, propertyType, neighborhood, message }),
      });
      setSubmitted(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar la solicitud",
        description: "Probá de nuevo en un momento, o escribinos directamente por WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      {/* Hero */}
      <AboutHero
        title="¿Querés saber cuánto vale tu propiedad?"
        subtitle="Realizamos tasaciones en Paraná, Oro Verde, San Benito, Colonia Avellaneda y localidades cercanas. Analizamos tu propiedad, su ubicación y el mercado actual para brindarte una orientación clara y realista."
        image="/tasaciones.jpg"
      />

      {/* How it works + Form */}
      <section className="py-20 bg-background relative -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: steps */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-8">Cómo funciona</h2>
              <div className="space-y-6">
                {STEPS.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border shadow-sm bg-card">
                      <CardContent className="p-6">
                        <div className="w-11 h-11 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                          <item.icon className="w-5 h-5 text-accent" />
                        </div>
                        <div className="text-xs font-bold tracking-widest text-accent uppercase mb-1">Paso {item.step}</div>
                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: form */}
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
                  <h2 className="text-xl font-bold text-primary mb-3">¡Solicitud enviada!</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    Recibimos tu solicitud de tasación y te vamos a contactar a la brevedad. Si preferís una respuesta más rápida, también podés escribirnos por WhatsApp.
                  </p>
                  <a href={WA_TASACION} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="font-semibold" data-testid="button-tasacion-whatsapp-fallback">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Escribir por WhatsApp
                    </Button>
                  </a>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-primary mb-2">Pedí una tasación</h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                    Te respondemos con una orientación inicial y coordinamos los pasos a seguir según tu caso.
                  </p>
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="val-name">Nombre</Label>
                      <Input id="val-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" data-testid="input-valuation-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="val-phone">Teléfono</Label>
                      <Input id="val-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tu número de contacto" data-testid="input-valuation-phone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="val-type">Tipo de propiedad</Label>
                      <Select value={propertyType} onValueChange={setPropertyType}>
                        <SelectTrigger id="val-type" data-testid="select-valuation-type">
                          <SelectValue placeholder="Seleccioná una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="val-neighborhood">Barrio o zona</Label>
                      <Input id="val-neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ej. Barrio Centro, Paraná" data-testid="input-valuation-neighborhood" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="val-message">Mensaje opcional</Label>
                      <Textarea id="val-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Contanos más detalles si querés..." className="min-h-[100px]" data-testid="input-valuation-message" />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                      data-testid="button-valuation-submit"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      {isSubmitting ? "Enviando..." : "Enviar solicitud de tasación"}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why free / trust */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <ClipboardCheck className="w-12 h-12 text-primary mx-auto mb-4" />
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
    </PageTransition>
  );
}
