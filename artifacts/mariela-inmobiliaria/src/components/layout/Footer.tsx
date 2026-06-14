import { Link } from "wouter";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <div className="flex flex-col text-primary-foreground">
                <span className="text-xl font-bold tracking-tight leading-none">MARIELA MARTÍNEZ</span>
                <span className="text-[0.65rem] tracking-widest opacity-80 uppercase">NEGOCIOS INMOBILIARIOS</span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              Inmobiliaria familiar en Paraná, Entre Ríos. Compra, venta, alquiler y tasaciones con atención personalizada desde 2020.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 tracking-wide">Enlaces Rápidos</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Inicio</Link>
              </li>
              <li>
                <Link href="/propiedades" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Propiedades</Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Nosotros</Link>
              </li>
              <li>
                <Link href="/tasaciones" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Tasaciones</Link>
              </li>
              <li>
                <Link href="/contacto" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Contacto</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 tracking-wide">Operaciones</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/propiedades?operation=venta" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Venta</Link>
              </li>
              <li>
                <Link href="/propiedades?operation=alquiler" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Alquiler</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 tracking-wide">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-primary-foreground/80 text-sm">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Paraná, Entre Ríos, Argentina</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/80 text-sm">
                <Phone className="w-5 h-5 shrink-0" />
                <span>343 621-4375</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/80 text-sm">
                <Mail className="w-5 h-5 shrink-0" />
                <span>contacto@marielamartinez.com.ar</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/10 text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            &copy; {new Date().getFullYear()} Mariela Martínez Negocios Inmobiliarios. Todos los derechos reservados.
          </p>
          <p className="text-primary-foreground/60 text-sm">
            <Link href="/admin" className="hover:text-primary-foreground transition-colors">Acceso Admin</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
