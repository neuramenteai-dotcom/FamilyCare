import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getFamilyDashboard } from "@/functions/dashboard.functions";
import { createCheckoutSession, verifyCheckoutSession } from "@/functions/payment.functions";
import { useServerFn } from "@tanstack/react-start";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
  const [authId, setAuthId] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: authSession } = await supabase.auth.getSession();
      if (!authSession.session) {
        navigate({ to: "/login" });
        return;
      }
      
      setAuthId(authSession.session.user.id);
      
      const res = await fetchDashboard({ data: { authId: authSession.session.user.id } });
      if (res.success) {
        setData(res);
        setFamilyId(res.familyId || null);

        // Se c'è un session_id, verifichiamo il pagamento
        if (search.session_id) {
          const verifyRes = await verify({ data: { sessionId: search.session_id } });
          if (verifyRes.success && verifyRes.has_active_package) {
            toast.success("Pagamento completato! Pacchetto attivato.");
            // Ricarica la dashboard per sbloccare i profili
            const newRes = await fetchDashboard({ data: { authId: authSession.session.user.id } });
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
          familyId,
          returnUrl: window.location.origin + "/famiglia/dashboard"
        }
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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

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
        <Button variant="ghost" onClick={() => { supabase.auth.signOut(); navigate({ to: "/" }); }}>
          Esci
        </Button>
      </header>
      
      <main className="container max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold mb-8">La tua Bacheca</h1>

        {data?.locked ? (
          <div className="bg-background p-8 rounded-3xl border border-border/60 text-center shadow-sm max-w-4xl mx-auto mt-8">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-semibold mb-2">Attiva il tuo Pacchetto</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-lg">
              Per vedere i profili completi dei professionisti verificati nella tua zona e poterli contattare direttamente, scegli un pacchetto per la tua famiglia.
            </p>
            
            <div className="max-w-md mx-auto text-left">
              <div className="border-2 border-primary rounded-2xl p-6 relative overflow-hidden flex flex-col bg-primary/5">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  PIÙ SCELTO
                </div>
                <h3 className="text-xl font-bold mb-2">Ricerca Famiglia</h3>
                <p className="text-muted-foreground text-sm mb-4 flex-grow">Ideale se hai bisogno di trovare una singola figura verificata in tempi brevi.</p>
                <div className="text-3xl font-bold mb-6">€ 29<span className="text-lg text-muted-foreground font-normal"> /una tantum</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex gap-2 items-start"><CheckCircle className="w-5 h-5 text-primary shrink-0"/> <span className="text-sm">Accesso ai profili verificati illimitato</span></li>
                  <li className="flex gap-2 items-start"><CheckCircle className="w-5 h-5 text-primary shrink-0"/> <span className="text-sm">Contatti illimitati con i professionisti</span></li>
                  <li className="flex gap-2 items-start"><CheckCircle className="w-5 h-5 text-primary shrink-0"/> <span className="text-sm">Supporto email standard</span></li>
                </ul>
                <Button 
                  className="w-full h-12 rounded-xl text-base mt-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft" 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Paga con Stripe"}
                </Button>
              </div>
            </div>
            
            <p className="mt-8 text-sm text-muted-foreground">
              Dopo il pagamento il tuo account verrà attivato istantaneamente. <br />
              Hai bisogno di aiuto? <a href="mailto:familycare@gmail.com" className="underline hover:text-foreground">Contattaci</a>
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.professionals?.map((pro: any) => (
              <div key={pro.id} className="bg-background rounded-3xl border border-border/60 p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-xl font-bold text-muted-foreground">
                    {pro.full_name?.charAt(0) || "P"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{pro.full_name?.split(' ')[0] || "Professionista"}</h3>
                    <p className="text-sm text-muted-foreground">{pro.city}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm flex-grow">
                  <div className="flex gap-2">
                    <span className="font-medium">Esperienza:</span>
                    <span className="text-muted-foreground">{pro.experience || "Non specificata"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Nazionalità:</span>
                    <span className="text-muted-foreground">{pro.nationality || "Non specificata"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Italiano:</span>
                    <span className="text-muted-foreground">{pro.italian_level || "Non specificato"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Servizi:</span>
                    <span className="text-muted-foreground">{(pro.services || []).join(", ")}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border/40">
                  <Button variant="secondary" className="w-full" onClick={() => toast.success("Richiesta inviata ad Admin! Ti metteremo in contatto a breve.")}>
                    Richiedi Contatto
                  </Button>
                </div>
              </div>
            ))}
            {data?.professionals?.length === 0 && (
              <p className="text-muted-foreground col-span-full">Nessun professionista disponibile al momento.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
