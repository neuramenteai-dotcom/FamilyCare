import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-24">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              La piattaforma italiana che connette famiglie e professionisti, con identità
              verificata prima della pubblicazione del profilo.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <Link
                to="/contatti"
                aria-label="Contattaci"
                className="h-9 w-9 grid place-items-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Servizi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/servizi" hash="badanti" className="hover:text-foreground">
                  Assistenti familiari
                </Link>
              </li>
              <li>
                <Link to="/servizi" hash="colf" className="hover:text-foreground">
                  Colf
                </Link>
              </li>
              <li>
                <Link to="/servizi" hash="babysitter" className="hover:text-foreground">
                  Babysitter
                </Link>
              </li>
              <li>
                <Link to="/servizi" hash="dogsitter" className="hover:text-foreground">
                  Dog sitter
                </Link>
              </li>
              <li>
                <Link to="/servizi" hash="tutor" className="hover:text-foreground">
                  Tutor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Azienda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/come-funziona" className="hover:text-foreground">
                  Come funziona
                </Link>
              </li>
              <li>
                <Link to="/sicurezza" className="hover:text-foreground">
                  Sicurezza
                </Link>
              </li>
              <li>
                <Link to="/prezzi" className="hover:text-foreground">
                  Prezzi
                </Link>
              </li>
              <li>
                <Link to="/contatti" className="hover:text-foreground">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Dove siamo</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="text-foreground font-medium">Roma</li>
              <li>Stiamo partendo da qui.</li>
              <li>Le altre città arriveranno dopo.</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60 mt-12 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FamilyCare. Tutti i diritti riservati.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/termini" className="hover:text-foreground">
              Termini
            </Link>
            <Link to="/cookie" className="hover:text-foreground">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
