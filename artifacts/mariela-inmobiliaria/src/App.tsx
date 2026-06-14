import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { AnimatePresence } from "framer-motion";

// Pages
import Home from "@/pages/home";
import PropertiesList from "@/pages/properties/index";
import PropertyDetail from "@/pages/properties/detail";
import About from "@/pages/about";
import Valuations from "@/pages/valuations";
import Contact from "@/pages/contact";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/index";
import PropertyForm from "@/pages/admin/property-form";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin Routes (No public layout) */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/propiedades/nueva" component={PropertyForm} />
      <Route path="/admin/propiedades/:id/editar" component={PropertyForm} />

      {/* Public Routes */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route path="/propiedades">
        <PublicLayout><PropertiesList /></PublicLayout>
      </Route>
      <Route path="/propiedades/:id">
        <PublicLayout><PropertyDetail /></PublicLayout>
      </Route>
      <Route path="/nosotros">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/tasaciones">
        <PublicLayout><Valuations /></PublicLayout>
      </Route>
      <Route path="/contacto">
        <PublicLayout><Contact /></PublicLayout>
      </Route>
      
      {/* 404 */}
      <Route>
        <PublicLayout><NotFound /></PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
