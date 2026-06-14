import { Link, useLocation } from "wouter";
import { LayoutDashboard, PlusCircle, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { PageTransition } from "@/components/layout/PageTransition";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation("/admin/login");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setLocation("/admin/login");
  };

  const navItems = [
    { label: "Propiedades", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Nueva Propiedad", href: "/admin/propiedades/nueva", icon: <PlusCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex-shrink-0 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-primary-foreground/10">
          <span className="font-bold text-lg tracking-tight">Panel Admin</span>
        </div>
        <div className="flex-1 py-6">
          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? "bg-primary-foreground/10 text-white" 
                      : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-primary-foreground/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-primary-foreground/70 hover:text-white hover:bg-primary-foreground/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-background border-b border-border px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-foreground">Gestión Inmobiliaria</h1>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">Ver Sitio Público</Button>
            </Link>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
