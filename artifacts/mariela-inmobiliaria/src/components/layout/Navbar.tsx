import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, ChevronDown } from "lucide-react";

const PROPERTY_CATEGORIES = [
  { label: "Casas", href: "/propiedades?type=casa" },
  { label: "Departamentos", href: "/propiedades?type=departamento" },
  { label: "Lotes y Terrenos", href: "/propiedades?type=terreno" },
  { label: "Campos", href: "/propiedades?type=campo" },
  { label: "Locales", href: "/propiedades?type=local" },
  { label: "Cocheras", href: "/propiedades?type=cochera" },
];

const ABOUT_CATEGORIES = [
  { label: "Quiénes somos", href: "/nosotros" },
  { label: "Calculadora de alquileres", href: "/nosotros/calculadora-de-alquileres" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [desktopAboutOpen, setDesktopAboutOpen] = useState(false);
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDesktopDropdownOpen(false);
      }
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setDesktopAboutOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAboutRoute = location === "/nosotros" || location.startsWith("/nosotros/");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex flex-col">
            <img
              src="/Logo-navbar.png"
              alt="Logo"
              className="h-15 w-60"
            />
            {/* <span className="text-xl font-bold tracking-tight text-primary leading-none">MARIELA MARTÍNEZ</span>
            <span className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">NEGOCIOS INMOBILIARIOS</span>
          */}
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6 items-center">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Inicio
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDesktopDropdownOpen((v) => !v)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  location === "/propiedades" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="button-propiedades-dropdown"
              >
                Propiedades
                <ChevronDown className={`h-4 w-4 transition-transform ${desktopDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {desktopDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/propiedades"
                    className="block px-4 py-2 text-sm font-semibold text-primary hover:bg-muted transition-colors border-b border-border/50 mb-1"
                    onClick={() => setDesktopDropdownOpen(false)}
                  >
                    Ver todas las propiedades
                  </Link>
                  {PROPERTY_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      onClick={() => setDesktopDropdownOpen(false)}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/tasaciones"
              className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                location === "/tasaciones" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Tasaciones
            </Link>

            <div className="relative" ref={aboutRef}>
              <button
                onClick={() => setDesktopAboutOpen((v) => !v)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  isAboutRoute ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="button-nosotros-dropdown"
              >
                Nosotros
                <ChevronDown className={`h-4 w-4 transition-transform ${desktopAboutOpen ? "rotate-180" : ""}`} />
              </button>
              {desktopAboutOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                  {ABOUT_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className={`block px-4 py-2 text-sm transition-colors hover:bg-muted ${
                        location === cat.href ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setDesktopAboutOpen(false)}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/contacto"
              className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                location === "/contacto" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Contacto
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Phone className="h-4 w-4" />
              <span>343 621-4375</span>
            </div>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-border/40 shadow-lg py-4 px-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
          <Link
            href="/"
            className={`block text-lg font-medium py-2 ${
              location === "/" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Inicio
          </Link>

          <button
            className="flex items-center justify-between text-lg font-medium py-2 text-muted-foreground w-full text-left"
            onClick={() => setMobilePropertiesOpen((v) => !v)}
          >
            Propiedades
            <ChevronDown className={`h-5 w-5 transition-transform ${mobilePropertiesOpen ? "rotate-180" : ""}`} />
          </button>
          {mobilePropertiesOpen && (
            <div className="pl-4 flex flex-col gap-1 mb-2">
              <Link
                href="/propiedades"
                className="block text-base font-medium py-1.5 text-primary"
                onClick={() => setIsOpen(false)}
              >
                Ver todas
              </Link>
              {PROPERTY_CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="block text-base py-1.5 text-muted-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/tasaciones"
            className={`block text-lg font-medium py-2 ${
              location === "/tasaciones" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Tasaciones
          </Link>

          <button
            className="flex items-center justify-between text-lg font-medium py-2 text-muted-foreground w-full text-left"
            onClick={() => setMobileAboutOpen((v) => !v)}
          >
            Nosotros
            <ChevronDown className={`h-5 w-5 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileAboutOpen && (
            <div className="pl-4 flex flex-col gap-1 mb-2">
              {ABOUT_CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className={`block text-base py-1.5 ${location === cat.href ? "text-primary font-semibold" : "text-muted-foreground"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/contacto"
            className={`block text-lg font-medium py-2 ${
              location === "/contacto" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Contacto
          </Link>

          <div className="pt-4 border-t border-border flex items-center gap-2 text-primary font-medium">
            <Phone className="h-5 w-5" />
            <span>343 621-4375</span>
          </div>
        </div>
      )}
    </nav>
  );
}
