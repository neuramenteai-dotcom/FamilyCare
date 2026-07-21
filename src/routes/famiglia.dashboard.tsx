import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getFamilyDashboard, contactProfessional } from "@/functions/dashboard.functions";
import {
  createCheckoutSession,
  verifyCheckoutSession,
  createBillingPortalSession,
} from "@/functions/payment.functions";
import { useServerFn } from "@tanstack/react-start";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, MessageCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PLANS, type PlanTier } from "@/lib/plans";
import { PlanSelector } from "@/components/family/PlanSelector";
import { ProfileCard, type FamilyProfile } from "@/components/family/ProfileCard";

export const Route = createFileRoute("/famiglia/dashboard")({
  validateSearch: z.object({ session_id: z.string().optional() }),
  component: FamilyDashboard,
});

function FamilyDashboard() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const fetchDashboard = useServerFn(getFamilyDashboard);
  const checkout = useServerFn(createCheckoutSession);
  const verify = useServerFn(verifyCheckoutSession);
  const contact = useServerFn(contactProfessional);
  const billingPortal = useServerFn(createBillingPortalSession);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [contactingId, setContactingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("Tutti");
  const [selectedCity, setSelectedCity] = useState("Tutte");

  async function reload() {
    const res = await fetchDashboard();
    if (res.success) setData(res);
    else toast.error(res.error);
    return res;
  }

  useEffect(() => {
    async function load() {
      const { data: authSession } = await supabase.auth.getSession();
      if (!authSession.session) {
        navigate({ to: "/login" });
        return;
      }
      const res = await reload();
      if (res.success && search.session_id) {
        const verifyRes = await verify({ data: { sessionId: search.session_id } });
        if (verifyRes.success && verifyRes.plan_tier) {
          toast.success("Abbonamento attivato!");
          await reload();
        }
        navigate({ to: "/famiglia/dashboard", replace: true });
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheckout(tier: PlanTier) {
    setLoadingTier(tier);
    try {
      const res = await checkout({
        data: { tier, returnUrl: window.location.origin + "/famiglia/dashboard" },
      });
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        toast.error(res.error || "Errore durante l'inizializzazione del pagamento.");
        setLoadingTier(null);
      }
    } catch {
      toast.error("Errore di connessione a Stripe.");
      setLoadingTier(null);
    }
  }

  async function handleContact(professionalId: string) {
    setContactingId(professionalId);
    try {
      const res = await contact({ data: { professionalId } });
      if (res.success && res.conversationId) {
        toast.success("Contatto sbloccato! Puoi chattare.");
        await reload();
        navigate({ to: "/chat/$conversationId", params: { conversationId: res.conversationId } });
      } else {
        toast.error(res.error || "Impossibile contattare il profilo.");
      }
    } catch {
      toast.error("Errore di connessione.");
    } finally {
      setContactingId(null);
    }
  }

  async function handleBillingPortal() {
    const res = await billingPortal({
      data: { returnUrl: window.location.origin + "/famiglia/dashboard" },
    });
    if (res.success && res.url) window.location.href = res.url;
    else toast.error(res.error || "Portale non disponibile.");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const professionals: FamilyProfile[] = data?.professionals || [];
  const allCities = Array.from(new Set(professionals.map((p) => p.city).filter(Boolean)));
  const allServices = Array.from(new Set(professionals.flatMap((p) => p.services || [])));

  const filtered = professionals.filter((pro) => {
    const name = (pro.full_name || pro.first_name || "").toLowerCase();
    const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
    const matchesService =
      selectedService === "Tutti" || (pro.services && pro.services.includes(selectedService));
    const matchesCity = selectedCity === "Tutte" || pro.city === selectedCity;
    return matchesSearch && matchesService && matchesCity;
  });

  const tier: PlanTier | null = data?.tier ?? null;
  const contactsCap: number | null = data?.contactsCap ?? null;
  const contactsUsed: number = data?.contactsUsed ?? 0;

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
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/messaggi">
              <MessageCircle className="w-4 h-4 mr-1.5" /> Messaggi
            </Link>
          </Button>
          {tier && (
            <Button variant="ghost" size="sm" onClick={handleBillingPortal}>
              <Settings className="w-4 h-4 mr-1.5" /> Abbonamento
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            Esci
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h1 className="text-3xl font-semibold">La tua Bacheca</h1>
          {tier && (
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full bg-primary/10 text-primary font-semibold px-3 py-1">
                Piano {PLANS[tier].label}
              </span>
              <span className="text-muted-foreground">
                Contatti:{" "}
                <strong className="text-foreground">
                  {contactsUsed}
                  {contactsCap != null ? ` / ${contactsCap}` : " (illimitati)"}
                </strong>
              </span>
            </div>
          )}
        </div>

        {data?.locked && <PlanSelector onChoose={handleCheckout} loadingTier={loadingTier} />}

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
                  {allCities.map((city) => (
                    <option key={city as string} value={city as string}>
                      {city as string}
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
                  {allServices.map((srv) => (
                    <option key={srv as string} value={srv as string}>
                      {srv as string}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {data?.locked ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((pro) => (
                <div
                  key={pro.id}
                  className="bg-background rounded-3xl border border-border/60 p-6 shadow-sm flex flex-col opacity-90"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-xl font-bold text-muted-foreground overflow-hidden shrink-0">
                      {pro.avatar_url ? (
                        <img src={pro.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (pro.first_name || "P").charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{pro.first_name}</h3>
                      <p className="text-sm text-muted-foreground">{pro.city}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex-grow">
                    Esperienza: {pro.experience || "—"}
                  </p>
                  <p className="mt-4 text-sm text-primary font-medium">
                    Abbonati per vedere il profilo completo e contattare
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((pro) => (
                <ProfileCard
                  key={pro.id}
                  pro={pro}
                  onContact={handleContact}
                  contacting={contactingId === pro.id}
                />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="bg-background p-10 rounded-3xl border border-border/60 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h3 className="text-xl font-medium mb-2">Nessun professionista trovato</h3>
              <p className="text-muted-foreground">Modifica i filtri o torna più tardi.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
