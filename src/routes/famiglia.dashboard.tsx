import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getFamilyDashboard } from "@/functions/dashboard.functions";
import { createCheckoutSession, verifyCheckoutSession } from "@/functions/payment.functions";
import { useServerFn } from "@tanstack/react-start";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, CheckCircle, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/famiglia/dashboard")({
  validateSearch: z.object({
    session_id: z.string().optional(),
  }),
  component: FamilyDashboard,
});

function FamilyDashboard() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const fetchDashboard = useServerFn(getFamilyDashboard);
  const checkout = useServerFn(createCheckoutSession);
  const verify = useServerFn(verifyCheckoutSession);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("Tutti");
  const [selectedCity, setSelectedCity] = useState("Tutte");
  const [selectedExperience, setSelectedExperience] = useState("Tutte");

  useEffect(() => {
    async function load() {
      const { data: authSession } = await supabase.auth.getSession();
      if (!authSession.session) {
        navigate({ to: "/login" });
        return;
      }

      const res = await fetchDashboard();
      if (res.success) {
        setData(res);
        setFamilyId(res.familyId || null);

        // Se c'è un session_id, verifichiamo il pagamento
        if (search.session_id) {
          const verifyRes = await verify({ data: { sessionId: search.session_id } });
          if (verifyRes.success && verifyRes.has_active_package) {
            toast.success("Pagamento completato! Pacchetto attivato.");
            // Ricarica la dashboard per sbloccare i profili
            const newRes = await fetchDashboard();
            if (newRes.success) setData(newRes);
          }
          // Rimuovi session_id dall'URL
          navigate({ to: "/famiglia/dashboard", replace: true });
        }
      } else {
        toast.error(res.error);
      }
      setLoading(false);
    }
    load();
  }, [navigate, fetchDashboard, search.session_id, verify]);

  const handleCheckout = async () => {
    if (!familyId) return;
    setCheckoutLoading(true);
    try {
      const res = await checkout({
        data: {
          returnUrl: window.location.origin + "/famiglia/dashboard",
        },
      });

      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        toast.error(res.error || "Errore durante l'inizializzazione del pagamento.");
        setCheckoutLoading(false);
      }
    } catch (err) {
      toast.error("Errore di connessione a Stripe.");
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const allServices = Array.from(
    new Set(data?.professionals?.flatMap((p: any) => p.services || []) || []),
  );
  const allCities = Array.from(
    new Set(data?.professionals?.map((p: any) => p.city).filter(Boolean) || []),
  );
  const allExperiences = Array.from(
    new Set(data?.professionals?.map((p: any) => p.experience).filter(Boolean) || []),
  );

  const filteredProfessionals =
    data?.professionals?.filter((pro: any) => {
      const matchesSearch =
        !searchQuery || pro.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesService =
        selectedService === "Tutti" || (pro.services && pro.services.includes(selectedService));
      const matchesCity = selectedCity === "Tutte" || pro.city === selectedCity;
      const matchesExperience =
        selectedExperience === "Tutte" || pro.experience === selectedExperience;
      return matchesSearch && matchesService && matchesCity && matchesExperience;
    }) || [];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b border-border/40 sticky top-0 z-10 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          {data?.full_name && (
            <span className="hidden sm:inline-block font-medium text-foreground ml-2">
              Ciao, {data.full_name}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            supabase.auth.signOut();
            navigate({ to: "/" });
          }}
        >
          Esci
        </Button>
      </header>

      <main className="container max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold mb-8">La tua Bacheca</h1>

        {data?.locked && (
          <div className="bg-primary/5 p-6 md:p-8 rounded-3xl border-2 border-primary/20 mb-10 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
            <div>
              <div className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                ABBONAMENTO MENSILE
              </div>
              <h2 className="text-2xl font-bold mb-2">Sblocca i contatti diretti</h2>
              <p className="text-muted-foreground text-base max-w-xl">
                Scopri le biografie complete, le nazionalità e contatta direttamente i
                professionisti verificati nella tua zona. Nessun limite, disdici quando vuoi.
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-2">
              <Button
                size="lg"
                className="w-full md:w-auto h-14 rounded-xl text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft px-8"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                Abbonati a 29€
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-12">
          {/* MATCHES SECTION */}
          {!data?.locked && data?.matches && data.matches.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-3xl">🎉</span> I tuoi Match Reali
              </h2>
              <p className="text-muted-foreground mb-6">
                Questi professionisti hanno visualizzato il tuo annuncio e sono interessati a
                lavorare con te. Puoi contattarli direttamente.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.matches.map((pro: any) => (
                  <div
                    key={pro.id}
                    className="bg-primary/5 rounded-3xl border-2 border-primary/20 p-6 shadow-sm flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MATCH
                    </div>
                    <div className="flex items-center gap-4 mb-4 mt-2">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-xl font-bold text-primary overflow-hidden">
                        {pro.avatar_url ? (
                          <img
                            src={pro.avatar_url}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          pro.full_name?.charAt(0) || "P"
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{pro.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{pro.city}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm flex-grow bg-background rounded-xl p-4 mb-4">
                      <div className="flex gap-2">
                        <span className="font-medium">Esperienza:</span>
                        <span className="text-muted-foreground">
                          {pro.experience || "Non specificata"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium">Servizi:</span>
                        <span className="text-muted-foreground">
                          {(pro.services || []).join(", ")}
                        </span>
                      </div>
                      {(pro.bio || pro.message) && (
                        <p className="mt-2 text-muted-foreground italic border-l-2 border-primary/30 pl-2 line-clamp-3">
                          "{pro.bio || pro.message}"
                        </p>
                      )}
                    </div>

                    <div className="mt-auto">
                      <a
                        href={`mailto:${pro.email}`}
                        className="w-full flex items-center justify-center h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Contatta via Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DISCOVERY SECTION (TEASER OR FULL) */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-semibold">Professionisti nella tua zona</h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca per nome..."
                    className="pl-9 w-full sm:w-48 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    className="h-9 w-full sm:w-40 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="Tutte">Tutte le Città</option>
                    {allCities.map((city: any) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    className="h-9 w-full sm:w-40 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                  >
                    <option value="Tutte">Esperienza</option>
                    {allExperiences.map((exp: any) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    className="h-9 w-full sm:w-48 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    <option value="Tutti">Tutti i Servizi</option>
                    {allServices.map((srv: any) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionals.map((pro: any) => (
                <div
                  key={pro.id}
                  className="bg-background rounded-3xl border border-border/60 p-6 shadow-sm flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-xl font-bold text-muted-foreground overflow-hidden">
                      {pro.avatar_url ? (
                        <img
                          src={pro.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        pro.full_name?.charAt(0) || "P"
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{pro.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{pro.city}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm flex-grow">
                    <div className="flex gap-2">
                      <span className="font-medium">Esperienza:</span>
                      <span className="text-muted-foreground">
                        {pro.experience || "Non specificata"}
                      </span>
                    </div>

                    {!data?.locked && (
                      <>
                        <div className="flex gap-2">
                          <span className="font-medium">Nazionalità:</span>
                          <span className="text-muted-foreground">
                            {pro.nationality || "Non specificata"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium">Italiano:</span>
                          <span className="text-muted-foreground">
                            {pro.italian_level || "Non specificato"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium">Servizi:</span>
                          <span className="text-muted-foreground">
                            {(pro.services || []).join(", ")}
                          </span>
                        </div>
                        {pro.bio && (
                          <div className="mt-3 p-3 bg-muted/30 rounded-xl">
                            <p className="text-muted-foreground line-clamp-3 italic">"{pro.bio}"</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/40">
                    {data?.locked ? (
                      <Button
                        variant="secondary"
                        className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-0"
                        onClick={handleCheckout}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Sblocca Profilo
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() =>
                          toast.success(
                            "Richiesta inviata ad Admin! Ti metteremo in contatto a breve.",
                          )
                        }
                      >
                        Richiedi Contatto
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {filteredProfessionals.length === 0 && (
                <div className="col-span-full bg-background p-10 rounded-3xl border border-border/60 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🔍
                  </div>
                  <h3 className="text-xl font-medium mb-2">Nessun professionista trovato</h3>
                  <p className="text-muted-foreground">
                    Modifica i filtri di ricerca o torna a controllare più tardi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
