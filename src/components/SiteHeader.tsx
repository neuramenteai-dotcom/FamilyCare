import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/servizi" as const, label: "Servizi" },
  { to: "/come-funziona" as const, label: "Come funziona" },
  { to: "/sicurezza" as const, label: "Sicurezza" },
  { to: "/prezzi" as const, label: "Prezzi" },
  { to: "/contatti" as const, label: "Contatti" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isReservedArea = 
    location.pathname.includes('/dashboard') || 
    location.pathname.includes('/admin') ||
    location.pathname.includes('/verifica-identita');

  if (isReservedArea) return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
              activeProps={{ className: "px-3 py-2 text-sm font-medium text-primary rounded-md" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Accedi</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
            <Link to="/" hash="iscriviti">Iscriviti gratis</Link>
          </Button>
        </div>

        <button
          aria-label="Apri menu"
          className="lg:hidden p-2 -mr-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-md text-base font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-2 rounded-full">
              <Link to="/" hash="iscriviti" onClick={() => setOpen(false)}>
                Iscriviti gratis
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
